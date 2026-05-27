import { useEffect, useRef, useState, useCallback } from 'react';
import type { RefObject } from 'react';
import type { Socket } from 'socket.io-client';
import { Panel, Group, Separator } from 'react-resizable-panels';
import CodeEditor from '../../../features/candidate/components/CodeEditor';
import ConsoleOutput from '../../../features/candidate/components/ConsoleOutput';
import TestResultPanel from '../../../features/candidate/components/TestResultPanel';
import { compilerService, type ExecutionResult, type SupportedLanguage } from '../../../features/candidate/services/compiler.service';
import { submissionService } from '../../../features/candidate/services/submission.service';
import { showError, showSuccess } from '../../utils/toast.util';

interface CodeCollabPanelProps {
  roomId: string;
  socketRef: RefObject<Socket | null>;
  initialCode?: string;
  initialLanguage?: string;
  problemId?: string;
  canSubmit?: boolean;
  lastRunResult?: ExecutionResult;
  lastRunError?: string;
}

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['javascript', 'python'];

const DEFAULT_CODE: Record<SupportedLanguage, string> = {
  javascript: '// Start coding...\n',
  python: '# Start coding...\n',
};

const normalizeLanguage = (language?: string): SupportedLanguage =>
  SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)
    ? (language as SupportedLanguage)
    : 'javascript';

const CodeCollabPanel = ({
  roomId,
  socketRef,
  initialCode,
  initialLanguage = 'javascript',
  problemId,
  canSubmit = false,
  lastRunResult,
  lastRunError,
}: CodeCollabPanelProps) => {
  const initialSupportedLanguage = normalizeLanguage(initialLanguage);
  const [code, setCode] = useState(initialCode || DEFAULT_CODE[initialSupportedLanguage]);
  const [language, setLanguage] = useState<SupportedLanguage>(initialSupportedLanguage);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(lastRunResult || null);
  const [executionError, setExecutionError] = useState(lastRunError || '');
  const [activeBottomTab, setActiveBottomTab] = useState<'results' | 'console'>('results');

  const codeRef = useRef(code);
  const languageRef = useRef(language);
  const versionRef = useRef(0);
  const isRemoteUpdateRef = useRef(false);

  useEffect(() => { codeRef.current = code; }, [code]);
  useEffect(() => { languageRef.current = language; }, [language]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleCodeSync = ({
      code: syncedCode,
      language: syncedLanguage,
      version,
    }: {
      code: string;
      language: string;
      version: number;
    }) => {
      if (version <= versionRef.current) return;

      versionRef.current = version;
      isRemoteUpdateRef.current = true;
      setCode(syncedCode);
      setLanguage(normalizeLanguage(syncedLanguage));
      isRemoteUpdateRef.current = false;
    };

    const handleLanguageChanged = ({ language: syncedLanguage }: { language: string }) => {
      setLanguage(normalizeLanguage(syncedLanguage));
    };

    const handleRunResult = ({
      result,
      error,
    }: {
      result?: ExecutionResult;
      error?: string;
    }) => {
      setIsRunning(false);
      setExecutionResult(result || null);
      setExecutionError(error || '');
      setActiveBottomTab(result?.stdout?.trim() || result?.stderr?.trim() || error ? 'console' : 'results');
    };

    socket.on('collab:code-sync', handleCodeSync);
    socket.on('collab:language-changed', handleLanguageChanged);
    socket.on('collab:run-result', handleRunResult);

    return () => {
      socket.off('collab:code-sync', handleCodeSync);
      socket.off('collab:language-changed', handleLanguageChanged);
      socket.off('collab:run-result', handleRunResult);
    };
  }, [socketRef]);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      codeRef.current = initialCode;
    }
  }, [initialCode]);

  useEffect(() => {
    const nextLanguage = normalizeLanguage(initialLanguage);
    setLanguage(nextLanguage);
    languageRef.current = nextLanguage;
  }, [initialLanguage]);

  useEffect(() => {
    setExecutionResult(lastRunResult || null);
    setExecutionError(lastRunError || '');
  }, [lastRunError, lastRunResult]);

  const handleCodeChange = useCallback(
    (nextCode: string) => {
      setCode(nextCode);
      codeRef.current = nextCode;

      if (isRemoteUpdateRef.current) return;

      versionRef.current += 1;
      socketRef.current?.emit('collab:code-changed', {
        roomId,
        code: nextCode,
        language: languageRef.current,
        version: versionRef.current,
      });
    },
    [roomId, socketRef]
  );

  const handleLanguageChange = useCallback(
    (nextLanguage: SupportedLanguage) => {
      setLanguage(nextLanguage);
      socketRef.current?.emit('collab:language-changed', { roomId, language: nextLanguage });
    },
    [roomId, socketRef]
  );

  const handleRunCode = useCallback(async () => {
    if (!codeRef.current.trim()) {
      showError('Please write some code first');
      return;
    }

    setIsRunning(true);
    setExecutionError('');
    setExecutionResult(null);
    setActiveBottomTab('results');

    try {
      const { token } = await compilerService.executeCode({
        language: languageRef.current,
        sourceCode: codeRef.current,
        problemId,
      });

      const result = await compilerService.pollResult(token);
      setExecutionResult(result);
      setActiveBottomTab(result.stdout?.trim() || result.stderr?.trim() ? 'console' : 'results');

      socketRef.current?.emit('collab:run-result', {
        roomId,
        result,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Object && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      const fallbackMessage = message || 'Failed to execute code. Please try again.';

      setExecutionError(fallbackMessage);
      setActiveBottomTab('console');
      socketRef.current?.emit('collab:run-result', {
        roomId,
        error: fallbackMessage,
      });
    } finally {
      setIsRunning(false);
    }
  }, [problemId, roomId, socketRef]);

  const handleSubmit = useCallback(async () => {
    if (!problemId || !canSubmit) return;

    if (!codeRef.current.trim()) {
      showError('Please write some code first');
      return;
    }

    setIsSubmitting(true);
    setExecutionError('');
    setExecutionResult(null);
    setActiveBottomTab('results');

    try {
      const submission = await submissionService.submit({
        problemId,
        language: languageRef.current,
        sourceCode: codeRef.current,
      });

      const result: ExecutionResult = {
        stdout: submission.stdout || null,
        stderr: submission.stderr || null,
        compile_output: submission.compile_output || null,
        status: {
          id: submission.status === 'accepted' ? 3 :
            submission.status === 'compilation_error' ? 6 :
              submission.status === 'runtime_error' ? 7 : 4,
          description: submission.status,
        },
        time: submission.time || null,
        memory: submission.memory || null,
        testResults: submission.testResults || [],
      };

      setExecutionResult(result);
      socketRef.current?.emit('collab:run-result', { roomId, result });

      if (submission.status === 'accepted') {
        showSuccess('All test cases passed');
      } else if (submission.status === 'wrong_answer') {
        showError('Wrong answer');
      } else {
        showError(submission.status.replaceAll('_', ' '));
      }
    } catch (error: unknown) {
      const message =
        error instanceof Object && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      const fallbackMessage = message || 'Failed to submit code';
      setExecutionError(fallbackMessage);
      setActiveBottomTab('console');
      socketRef.current?.emit('collab:run-result', { roomId, error: fallbackMessage });
      showError(fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, problemId, roomId, socketRef]);

  const hasConsole = !!(executionResult?.stdout?.trim() || executionResult?.stderr?.trim() || executionError);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <div className="h-12 flex items-center gap-3 px-4 border-b border-[#272b3a] bg-[#111111] shrink-0">
        <button
          onClick={handleRunCode}
          disabled={isRunning || isSubmitting}
          className="h-8 px-4 rounded-lg bg-[var(--color-primary)] text-white hover:bg-blue-600 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>

        {canSubmit && problemId && (
          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="h-8 px-4 rounded-lg bg-[#242424] border border-[#3a3a3a] text-white hover:bg-[#303030] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        )}

        <select
          value={language}
          onChange={(event) => handleLanguageChange(event.target.value as SupportedLanguage)}
          className="h-8 px-3 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white text-sm focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none cursor-pointer"
        >
          <option value="python">Python 3</option>
          <option value="javascript">JavaScript</option>
        </select>

        <div className="ml-auto text-[10px] text-gray-600 tracking-widest uppercase">
          Collaborative Compiler
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Group orientation="vertical">
          <Panel defaultSize={60} minSize={30}>
            <div className="h-full bg-[#1e1e1e] overflow-hidden">
              <CodeEditor value={code} onChange={handleCodeChange} language={language} />
            </div>
          </Panel>

          <Separator className="h-1 bg-[#2a2d3a] hover:bg-[var(--color-primary)] transition-colors" />

          <Panel defaultSize={40} minSize={20}>
            <div className="h-full flex flex-col bg-[#0a0a0a] overflow-hidden">
              <div className="flex items-center gap-4 px-4 py-2 border-b border-[#2a2d3a] shrink-0">
                <button
                  onClick={() => setActiveBottomTab('results')}
                  className={`text-sm font-medium transition-colors ${
                    activeBottomTab === 'results'
                      ? 'text-white border-b-2 border-[var(--color-primary)] pb-1'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Test Result
                </button>

                {hasConsole && (
                  <button
                    onClick={() => setActiveBottomTab('console')}
                    className={`text-sm font-medium transition-colors ${
                      activeBottomTab === 'console'
                        ? 'text-white border-b-2 border-[var(--color-primary)] pb-1'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Console
                    {executionResult?.stdout?.trim() && (
                      <span className="ml-1.5 w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full inline-block" />
                    )}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-hidden">
                {activeBottomTab === 'results' && (
                  <TestResultPanel
                    results={executionResult?.testResults || []}
                    compileOutput={executionResult?.compile_output || undefined}
                    runtimeError={executionResult?.stderr || executionError || undefined}
                    isRunning={isRunning || isSubmitting}
                    isSubmission={isSubmitting}
                  />
                )}

                {activeBottomTab === 'console' && (
                  <ConsoleOutput result={executionResult} isRunning={isRunning || isSubmitting} error={executionError} />
                )}
              </div>
            </div>
          </Panel>
        </Group>
      </div>
    </div>
  );
};

export default CodeCollabPanel;
