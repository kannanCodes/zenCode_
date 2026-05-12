import { exec } from 'child_process';
import { promisify } from 'util';
import { AppError } from '../../shared/utils/AppError';
import { STATUS_CODES } from '../../shared/constants/status';
import { ExecuteCodeDto, ExecutionResultDto, TestCaseResultDto } from '../../dtos/compiler/execute-code.dto';
import { IDockerExecutionService } from '../../interfaces/infrastructure-interfaces/execution/IDockerExecutionService';
import { DOCKER_IMAGE_MAP, DEFAULT_TIMEOUT } from '../../constants/compiler.constants';
import { logger } from '../../shared/utils/Logger';

const execAsync = promisify(exec);

export class DockerExecutionService implements IDockerExecutionService {
  private wrapCode(
    language: string,
    sourceCode: string,
    testCases: Array<{ input: string; output: string; isHidden: boolean }>,
    functionSignature?: { functionName: string; parameters: Array<{ name: string; type: string }>; returnType: string }
  ): string {
    if (!testCases || testCases.length === 0 || !functionSignature) {
      return sourceCode;
    }

    const { functionName } = functionSignature;

    // JavaScript runner (Node)
    if (language === 'javascript') {
      return `
${sourceCode}

const testCases = ${JSON.stringify(testCases)};
(async () => {
    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        try {
            let args = [];
            try {
                const parsed = JSON.parse(tc.input);
                args = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                try {
                    const wrapped = JSON.parse('[' + tc.input + ']');
                    args = wrapped;
                } catch (inner) {
                    args = [tc.input];
                }
            }
            
            console.log(\`TOKEN_START_\${i}\`);
            
            // Robust runner detection (Function or Class-based)
            let runner;
            if (typeof Solution !== 'undefined') {
                const sol = new Solution();
                if (typeof sol.${functionName} === 'function') {
                    runner = sol.${functionName}.bind(sol);
                }
            }
            
            if (!runner && typeof ${functionName} === 'function') {
                runner = ${functionName};
            }

            if (!runner) {
                throw new Error("Function '${functionName}' not found in Solution class or global scope.");
            }

            const result = await runner(...args);
            console.log(\`TOKEN_RESULT\`);
            console.log(JSON.stringify(result === undefined ? null : result));
            console.log(\`TOKEN_END\`);
        } catch (e) {
            console.log(\`TOKEN_START_\${i}\`);
            console.log(\`TOKEN_ERROR\`);
            console.log(e.stack || e.message);
            console.log(\`TOKEN_END\`);
        }
    }
})();
`;
    }

    // Python runner
    if (language === 'python') {
      const encodedUserCode = Buffer.from(sourceCode).toString('base64');
      return `
import json
import sys
import traceback
import base64
from typing import List, Dict, Tuple, Optional, Any

# Decode and execute user code in a separate namespace
user_code = base64.b64decode("${encodedUserCode}").decode('utf-8')
namespace = {
    'List': List, 'Dict': Dict, 'Tuple': Tuple, 'Optional': Optional, 'Any': Any
}

try:
    exec(user_code, namespace)
except Exception as e:
    print("TOKEN_ERROR")
    # Report syntax or structure errors immediately
    msg = "".join(traceback.format_exception_only(type(e), e)).strip()
    print(msg)
    print("TOKEN_END")
    sys.exit(0)

test_cases = json.loads(${JSON.stringify(JSON.stringify(testCases))})
for i, tc in enumerate(test_cases):
    print(f"TOKEN_START_{i}")
    try:
        args = []
        raw_input = tc.get('input', '')

        # Try direct JSON first (for well-formed JSON like "[1,2]" or "{\\"a\\":1}")
        try:
            parsed = json.loads(raw_input)
            args = parsed if isinstance(parsed, list) else [parsed]
        except Exception:
            # Fallback: wrap in brackets so inputs like "nums, target" become a JSON array
            try:
                wrapped = json.loads(f"[{raw_input}]")
                args = wrapped if isinstance(wrapped, list) else [wrapped]
            except Exception:
                # Last resort: pass the raw string as a single argument
                args = [raw_input]
        
        # Robust runner detection
        runner = None
        if 'Solution' in namespace:
            sol_class = namespace['Solution']
            if isinstance(sol_class, type):
                sol = sol_class()
                if hasattr(sol, '${functionName}'):
                    runner = getattr(sol, '${functionName}')
        
        if not runner and '${functionName}' in namespace:
            runner = namespace['${functionName}']

        if not runner:
            raise Exception("Function '${functionName}' not found in Solution class or global scope.")

        result = runner(*args)
        print("TOKEN_RESULT")
        print(json.dumps(result))
        print("TOKEN_END")
    except Exception as e:
        print("TOKEN_ERROR")
        # Clean traceback to show only user relevant part
        err_msg = "".join(traceback.format_exception_only(type(e), e)).strip()
        print(err_msg)
        print("TOKEN_END")
`;
    }

    return sourceCode;
  }

  async executeCode(input: ExecuteCodeDto): Promise<ExecutionResultDto> {
    const { language, sourceCode, stdin, testCases, functionSignature } = input;

    const config = DOCKER_IMAGE_MAP[language];
    if (!config) {
      throw new AppError(`Unsupported language for native execution: ${language}`, STATUS_CODES.BAD_REQUEST);
    }

    try {
      const wrappedCode = this.wrapCode(language, sourceCode, testCases || [], functionSignature);
      const encodedCode = Buffer.from(wrappedCode).toString('base64');
      
      const fileName = 'solution';
      const compileCmd = '';
      
      const dockerCmd = `echo ${JSON.stringify(stdin || '')} | docker run --rm -i ${config.image} sh -c "echo ${encodedCode} | base64 -d > /tmp/${fileName}.${config.extension} && ${compileCmd}${config.runtime}"`;

      logger.info(`Executing Docker command: ${dockerCmd}`);

      const { stdout, stderr } = await execAsync(dockerCmd, { timeout: DEFAULT_TIMEOUT });

      let statusId = 3; // Accepted
      let description = 'Accepted';
      const testResults: TestCaseResultDto[] = [];
      let finalStdout = stdout;

      if (testCases && testCases.length > 0) {
        let allPassed = true;
        
        for (let i = 0; i < testCases.length; i++) {
          const startMarker = `TOKEN_START_${i}`;
          const endMarker = `TOKEN_END`;
          
          const startIdx = stdout.indexOf(startMarker);
          const endIdx = stdout.indexOf(endMarker, startIdx);

          if (startIdx !== -1 && endIdx !== -1) {
            const caseOutput = stdout.substring(startIdx + startMarker.length, endIdx).trim();
            
            // Extract tokens within the case output
            const resultMarker = "TOKEN_RESULT";
            const errorMarker = "TOKEN_ERROR";
            
            let passed = false;
            let actualOutput = "";
            let error = undefined;

            if (caseOutput.includes(errorMarker)) {
                error = caseOutput.replace(errorMarker, "").trim();
                passed = false;
                allPassed = false;
            } else if (caseOutput.includes(resultMarker)) {
                actualOutput = caseOutput.replace(resultMarker, "").trim();
                const expectedOutput = testCases[i].output.trim();

                try {
                    const actual = JSON.parse(actualOutput);
                    const expected = JSON.parse(expectedOutput);
                    passed = JSON.stringify(actual) === JSON.stringify(expected);
                } catch {
                    passed = actualOutput === expectedOutput;
                }
                
                if (!passed) allPassed = false;
            }

            testResults.push({
                input: testCases[i].input,
                expectedOutput: testCases[i].output,
                actualOutput,
                passed,
                error
            });
          } else {
            allPassed = false;
            
            // Try to extract a useful error message from stdout or stderr if markers are missing
            let errorMessage = "Internal Error: Test case markers not found";
            if (stderr) {
                errorMessage = stderr.trim();
            } else if (stdout && stdout.length > 0) {
                // If marks are missing but stdout has content, it might be a silent crash or syntax error
                errorMessage = stdout.trim().substring(0, 500); 
            }

            testResults.push({
                input: testCases[i].input,
                expectedOutput: testCases[i].output,
                actualOutput: "",
                passed: false,
                error: errorMessage
            });
          }
        }

        // Clean up finalStdout to remove markers and internal runner output (results/errors)
        finalStdout = stdout
          .replace(/TOKEN_RESULT[\s\S]*?TOKEN_END/g, '')
          .replace(/TOKEN_ERROR[\s\S]*?TOKEN_END/g, '')
          .replace(/TOKEN_START_\d+[\r\n]*/g, '')
          .trim();

        if (!allPassed) {
            statusId = 4; // Use 4 for fail (Wrong Answer / Runtime Error)
            description = testResults.some(r => r.error) ? 'Runtime Error' : 'Wrong Answer';
        }
      }

      return {
        stdout: finalStdout,
        stderr: stderr || '',
        compile_output: '',
        status: {
          id: statusId,
          description: description,
        },
        testResults,
        time: '0.100',
        memory: 1024,
      };
    } catch (error: unknown) {
      const err = error as { stderr?: string; message?: string; stdout?: string; stack?: string };
      logger.error('Docker Execution failed', {
        error: err.message,
        stderr: err.stderr,
        stack: err.stack
      });
      
      const stderr = err.stderr || err.message || '';
      const isDockerError = stderr.includes('docker:') || stderr.includes('Unable to find image') || stderr.includes('no matching manifest');
      
      return {
        stdout: err.stdout || '',
        stderr: stderr,
        compile_output: '',
        status: {
          id: isDockerError ? 13 : 4, // 13 = Internal Error (roughly)
          description: isDockerError ? 'System Error' : 'Runtime Error',
        },
        testResults: [],
        time: null,
        memory: null,
      };
    }
  }
}
