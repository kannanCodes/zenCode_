import { useState } from 'react';

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
}

interface TestResultPanelProps {
  results: TestResult[];
  compileOutput?: string;
  runtimeError?: string;
  isRunning?: boolean;
  isSubmission?: boolean;
}

const getOverallStatus = (results: TestResult[]) => {
  if (!results || results.length === 0) return null;
  
  const allPassed = results.every(r => r.passed);
  const hasErrors = results.some(r => r.error);
  
  if (allPassed) return { status: 'Accepted', color: 'text-green-500', icon: '✓' };
  if (hasErrors) return { status: 'Runtime Error', color: 'text-red-500', icon: '✗' };
  return { status: 'Wrong Answer', color: 'text-yellow-500', icon: '✗' };
};

const TestResultPanel = ({ results, compileOutput, runtimeError, isRunning, isSubmission }: TestResultPanelProps) => {
  const [activeTab, setActiveTab] = useState(0);

  if (isRunning) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-gray-400 font-medium">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--color-primary)]"></div>
        <span>Running tests...</span>
      </div>
    );
  }

  if (compileOutput) {
    return (
      <div className="flex flex-col h-full bg-[#0a0a0a] p-4">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xl font-bold text-red-500">Compile Error</span>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 overflow-y-auto">
          <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap">
            {compileOutput}
          </pre>
        </div>
      </div>
    );
  }

  if (runtimeError && (!results || results.length === 0)) {
    return (
      <div className="flex flex-col h-full bg-[#0a0a0a] p-4">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xl font-bold text-red-500">Runtime Error</span>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 overflow-y-auto">
          <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap">
            {runtimeError}
          </pre>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] flex items-center justify-center border border-[#2a2d3a]">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-gray-400 font-medium mb-1">No results yet</p>
          <p className="text-gray-500 text-xs text-center max-w-[200px]">
            Write your solution and click "Run Code" to test against example cases.
          </p>
        </div>
      </div>
    );
  }

  const currentResult = results[activeTab];

  const overall = getOverallStatus(results);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Overall Status Banner */}
      {overall && (
        <div className={`px-4 py-3 border-b border-[#2a2d3a] flex items-center justify-between ${
          overall.status === 'Accepted' ? 'bg-green-500/10' : 'bg-red-500/10'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${overall.color}`}>{overall.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <div className={`text-lg font-bold ${overall.color}`}>{overall.status}</div>
                {isSubmission && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                    Submission
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                {results.filter(r => r.passed).length} / {results.length} test cases passed
                {isSubmission && ' (including hidden tests)'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2d3a] overflow-x-auto">
        {results.map((result, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === idx
                ? 'bg-[#1a1a1a] text-white border border-[#3a3d4a]'
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${result.passed ? 'bg-green-500' : 'bg-red-500'}`} />
            Case {idx + 1}
          </button>
        ))}
      </div>

      {/* Result Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between gap-4">
            <span className={`text-xl font-bold ${currentResult.passed ? 'text-green-500' : 'text-red-500'}`}>
              {currentResult.error ? 'Runtime Error' : currentResult.passed ? 'Accepted' : 'Wrong Answer'}
            </span>
            {currentResult.error && (
              <span className="px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-xs font-mono">
                Error Occurred
              </span>
            )}
          </div>

          {/* Input */}
          <div>
            <label className="text-gray-400 text-xs mb-2 block font-medium uppercase tracking-wider">Input</label>
            <div className="bg-[#1a1a1a] border border-[#2a2d3a] rounded-lg p-3">
              <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                {currentResult.input}
              </pre>
            </div>
          </div>

          {/* Actual Output */}
          <div>
            <label className="text-gray-400 text-xs mb-2 block font-medium uppercase tracking-wider">Output</label>
            <div className={`bg-[#1a1a1a] border ${currentResult.passed ? 'border-[#2a2d3a]' : 'border-red-500/30'} rounded-lg p-3`}>
              <pre className={`${currentResult.passed ? 'text-white' : 'text-red-400'} font-mono text-sm whitespace-pre-wrap`}>
                {currentResult.actualOutput || (currentResult.error ? 'Error' : 'No output')}
              </pre>
            </div>
          </div>

          {/* Expected Output - Only show if no runtime error */}
          {!currentResult.error && (
            <div>
              <label className="text-gray-400 text-xs mb-2 block font-medium uppercase tracking-wider">Expected</label>
              <div className="bg-[#1a1a1a] border border-[#2a2d3a] rounded-lg p-3">
                <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                  {currentResult.expectedOutput}
                </pre>
              </div>
            </div>
          )}

          {/* Error Message if any */}
          {currentResult.error && (
            <div>
              <label className="text-red-400 text-xs mb-2 block font-medium uppercase tracking-wider">Error Details</label>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap">
                  {currentResult.error}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResultPanel;
