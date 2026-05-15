import { useState } from 'react';

interface TestCase {
  input: string;
  output: string;
  isHidden?: boolean;
}

interface TestCasePanelProps {
  testCases: TestCase[];
  onRunTestCase?: (testCase: TestCase, index: number) => void;
  isRunning?: boolean;
}

const TestCasePanel = ({ testCases, onRunTestCase, isRunning }: TestCasePanelProps) => {
  const [activeTab, setActiveTab] = useState(0);

  // Filter out hidden test cases (though backend should already do this)
  const visibleTestCases = testCases.filter((tc) => !tc.isHidden);

  if (visibleTestCases.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        No test cases available
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full bg-[#0a0a0a]">
      {/* Tabs */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2d3a] overflow-x-auto">
        {visibleTestCases.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === idx
                ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/50'
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            Case {idx + 1}
          </button>
        ))}
      </div>

      {/* Test Case Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block font-medium">Input</label>
            <div className="bg-[#1a1a1a] border border-[#2a2d3a] rounded-lg p-3">
              <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                {visibleTestCases[activeTab]?.input || ''}
              </pre>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block font-medium">Expected Output</label>
            <div className="bg-[#1a1a1a] border border-[#2a2d3a] rounded-lg p-3">
              <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                {visibleTestCases[activeTab]?.output || ''}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Run Button */}
      {onRunTestCase && (
        <div className="p-4 border-t border-[#2a2d3a]">
          <button
            onClick={() => onRunTestCase(visibleTestCases[activeTab], activeTab)}
            className="w-full h-10 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white transition-all font-medium text-sm"
          >
            Run This Test
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isRunning && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-3 text-gray-300 text-sm">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--color-primary)] border-t-transparent" />
            <span>Running tests...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCasePanel;