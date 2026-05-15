import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { candidateProblemService, type Problem } from '../services/problem.service';
import { compilerService, type SupportedLanguage, type ExecutionResult } from '../services/compiler.service';
import { tokenService } from '../../../shared/lib/token';
import { showSuccess, showError } from '../../../shared/utils/toast.util';
import CodeEditor from '../components/CodeEditor';
import ProblemDescription from '../components/ProblemDescription';
import TestCasePanel from '../components/TestCasePanel';
import ConsoleOutput from '../components/ConsoleOutput';
import TestResultPanel from '../components/TestResultPanel';
import axios from 'axios';
import { submissionService } from '../services/submission.service';



const ALL_LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string }[] = [
  { value: 'python', label: 'Python 3' },
  { value: 'javascript', label: 'JavaScript' },
];

// Helper function to get available languages for a problem
const getAvailableLanguages = (supportedLanguages?: string[]) => {
  // If supportedLanguages is provided and not empty, it is the absolute source of truth
  if (supportedLanguages && supportedLanguages.length > 0) {
    return ALL_LANGUAGE_OPTIONS.filter((lang) =>
      supportedLanguages.includes(lang.value)
    );
  }

  // If no specific languages are supported, we allow all (default platform behavior)
  return ALL_LANGUAGE_OPTIONS;
};

const DEFAULT_CODE: Record<SupportedLanguage, string> = {
  python: '# Write your code here\n\n',
  javascript: '// Write your code here\n\n',
};

const ProblemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executionError, setExecutionError] = useState<string>('');
  const [activeBottomTab, setActiveBottomTab] = useState<'testcases' | 'results' | 'console'>('testcases');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute available languages dynamically for render
  const availableLanguages = problem
    ? getAvailableLanguages(problem.supportedLanguages)
    : ALL_LANGUAGE_OPTIONS;

  // Reset active tab if console becomes hidden
  useEffect(() => {
    const hasConsole = !!(executionResult?.stdout?.trim() || executionResult?.compile_output?.trim() || executionResult?.stderr?.trim());
    if (activeBottomTab === 'console' && !hasConsole) {
      setActiveBottomTab('results');
    }
  }, [executionResult, activeBottomTab]);

  useEffect(() => {
    if (id) {
      loadProblem(id);
    }
  }, [id]);

  const loadProblem = async (problemId: string) => {
    setIsLoading(true);
    try {
      const response = await candidateProblemService.getProblem(problemId);
      const prob = response.data;
      setProblem(prob);

      // Determine available languages for this specific problem
      const avail = getAvailableLanguages(prob.supportedLanguages);

      // Pick a valid language - try current selection first, then default to first available
      let currentLang = selectedLanguage;
      if (!avail.find(l => l.value === currentLang)) {
        currentLang = avail[0]?.value || 'python';
        setSelectedLanguage(currentLang);
      }

      // Set starter code for the determined language
      const starterCode = prob.starterCode?.[currentLang];
      if (starterCode) {
        setCode(starterCode);
      } else {
        setCode(DEFAULT_CODE[currentLang]);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          tokenService.clear();
          navigate('/login');
          return;
        }
        if (error.response?.status === 404) {
          showError('Problem not found');
          navigate('/problems');
          return;
        }
      }
      showError('Failed to load problem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    const starterCode = problem?.starterCode?.[lang];
    setCode(starterCode || DEFAULT_CODE[lang]);
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      showError('Please write some code first');
      return;
    }

    setIsRunning(true);
    setExecutionError('');
    setExecutionResult(null);

    try {
      // Execute code
      const { token } = await compilerService.executeCode({
        language: selectedLanguage,
        sourceCode: code,
        problemId: id,
      });

      // Poll for result
      const result = await compilerService.pollResult(token);
      setExecutionResult(result);
      
      const isSuccessful = result.status.id === 3;
      if (isSuccessful) {
        showSuccess('Code executed successfully!');
      }

      // Smart tab switching:
      // 1. If there's a compile error -> Stay on Results (we show it there now)
      // 2. If there are actual logs in stdout (not markers) -> Console
      // 3. Otherwise -> Results (default)
      
      const hasCompileError = !!result.compile_output;
      const hasLogs = result.stdout && result.stdout.trim().length > 0;
      
      if (hasLogs && !hasCompileError) {
        setActiveBottomTab('console');
      } else {
        setActiveBottomTab('results');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setExecutionError(error.response.data.message);
      } else {
        setExecutionError('Failed to execute code. Please try again.');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      showError('Please write some code first');
      return;
    }

    setIsSubmitting(true);
    setExecutionError('');
    setExecutionResult(null);
    setActiveBottomTab('results');

    try {
      const submission = await submissionService.submit({
        problemId: id!,
        language: selectedLanguage,
        sourceCode: code,
      });

      // Transform submission to ExecutionResult format
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

      if (submission.status === 'accepted') {
        showSuccess('✅ All test cases passed! Accepted!');
      } else if (submission.status === 'compilation_error') {
        showError('Compilation error');
      } else if (submission.status === 'runtime_error') {
        showError('Runtime error');
      } else if (submission.status === 'wrong_answer') {
        showError('Wrong answer - Some test cases failed');
      }

      setActiveBottomTab('results');
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setExecutionError(error.response.data.message);
        showError(error.response.data.message);
      } else {
        setExecutionError('Submission failed. Please try again.');
        showError('Submission failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    const starterCode = problem?.starterCode?.[selectedLanguage];
    setCode(starterCode || DEFAULT_CODE[selectedLanguage]);
    setExecutionResult(null);
    setExecutionError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Problem not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="h-14 bg-[#0a0a0a] border-b border-[#1c1c1c] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/problems')}
            className="text-[var(--color-primary)] font-bold text-lg hover:opacity-80 transition-opacity"
          >
            zenCode
          </button>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 text-sm">{problem.title}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="h-9 px-5 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white hover:bg-[#2a2d3a] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="h-9 px-5 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>

          <span className="text-gray-600">|</span>

          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
            className="h-9 px-3 rounded-lg bg-[#1a1a1a] border border-[#2a2d3a] text-white text-sm focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none cursor-pointer"
          >
            {availableLanguages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="h-9 px-3 rounded-lg border border-[#2a2d3a] text-gray-400 hover:text-white hover:border-gray-500 transition-all text-sm"
            title="Reset to starter code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {/* AI Hint Button */}
          <button
            className="h-9 px-3 rounded-lg border border-[#2a2d3a] text-gray-400 hover:text-white hover:border-gray-500 transition-all"
            title="Get AI Hint"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content with Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal">
          {/* Left Panel: Problem Description */}
          <Panel defaultSize="50" minSize="30">
            <div className="h-full overflow-hidden">
              <ProblemDescription
                title={problem.title}
                difficulty={problem.difficulty}
                description={problem.description}
                examples={problem.examples}
                constraints={problem.constraints}
                tags={problem.tags}
                companyTags={problem.companyTags}
                functionSignature={problem.functionSignature}
                isPremium={problem.isPremium}
              />
            </div>
          </Panel>

          {/* Resize Handle */}
          <Separator className="w-1 bg-[#2a2d3a] hover:bg-[var(--color-primary)] transition-colors" />

          {/* Right Panel: Code Editor + Bottom Panel */}
          <Panel defaultSize="50" minSize="30">
            <Group orientation="vertical">
              {/* Top: Code Editor */}
              <Panel defaultSize="60" minSize="30">
                <div className="h-full bg-[#1e1e1e] overflow-hidden">
                  <CodeEditor value={code} onChange={setCode} language={selectedLanguage} />
                </div>
              </Panel>

              {/* Resize Handle */}
              <Separator className="h-1 bg-[#2a2d3a] hover:bg-[var(--color-primary)] transition-colors" />

              {/* Bottom: Test Cases / Console */}
              <Panel defaultSize="40" minSize="20">
                <div className="h-full flex flex-col bg-[#0a0a0a] overflow-hidden">
                  {/* Tabs */}
                  <div className="flex items-center gap-4 px-4 py-2 border-b border-[#2a2d3a] flex-shrink-0">
                    <button
                      onClick={() => setActiveBottomTab('testcases')}
                      className={`text-sm font-medium transition-colors ${
                        activeBottomTab === 'testcases' ? 'text-white border-b-2 border-[var(--color-primary)] pb-1' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Test Cases
                    </button>
                    <button
                      onClick={() => setActiveBottomTab('results')}
                      className={`text-sm font-medium transition-colors ${
                        activeBottomTab === 'results' ? 'text-white border-b-2 border-[var(--color-primary)] pb-1' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Test Result
                    </button>
                    {/* Only show console tab if there are actual user logs (not just test markers) */}
            {executionResult && (executionResult.stdout?.trim() || executionResult.stderr?.trim()) && (
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

                  {/* Tab Content */}
                  <div className="flex-1 overflow-hidden">
                    {activeBottomTab === 'testcases' && (
                      <TestCasePanel testCases={problem.testCases || []} isRunning={isRunning} />
                    )}
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
                      <ConsoleOutput result={executionResult} isRunning={isRunning} error={executionError} />
                    )}
                  </div>
                </div>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>

      {/* Footer - Just Back Button */}
      <div className="h-10 bg-[#0a0a0a] border-t border-[#1c1c1c] flex items-center px-4 flex-shrink-0">
        <button
          onClick={() => navigate('/problems')}
          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Problems
        </button>
      </div>
    </div>
  );
};

export default ProblemDetailPage;