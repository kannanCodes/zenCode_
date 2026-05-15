interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

interface ConsoleOutputProps {
  result: ExecutionResult | null;
  isRunning: boolean;
  error?: string;
}

const ConsoleOutput = ({ result, isRunning, error }: ConsoleOutputProps) => {

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2a2d3a] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">Console</span>
        </div>
        {result && result.time && result.memory && (
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Runtime: {result.time}s</span>
            <span>Memory: {(result.memory / 1024).toFixed(2)} MB</span>
          </div>
        )}
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-4">
        {isRunning ? (
          <div className="flex items-center gap-3 text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--color-primary)]"></div>
            <span>Running code...</span>
          </div>
        ) : error ? (
          <div className="text-red-400 font-mono text-sm whitespace-pre-wrap">{error}</div>
        ) : result ? (
          <div className="space-y-4">
            {/* Compilation Error */}
            {result.compile_output && (
              <div>
                <div className="text-red-400 font-medium mb-2">Compilation Error:</div>
                <pre className="text-red-400 font-mono text-sm bg-[#1a1a1a] border border-red-500/30 rounded-lg p-3 whitespace-pre-wrap">
                  {result.compile_output}
                </pre>
              </div>
            )}

            {/* Standard Output */}
            {result.stdout && (
              <div>
                <div className="text-gray-400 font-medium mb-2">Output:</div>
                <pre className="text-white font-mono text-sm bg-[#1a1a1a] border border-[#2a2d3a] rounded-lg p-3 whitespace-pre-wrap">
                  {result.stdout}
                </pre>
              </div>
            )}

            {/* Standard Error */}
            {result.stderr && (
              <div>
                <div className="text-red-400 font-medium mb-2">Error:</div>
                <pre className="text-red-400 font-mono text-sm bg-[#1a1a1a] border border-red-500/30 rounded-lg p-3 whitespace-pre-wrap">
                  {result.stderr}
                </pre>
              </div>
            )}

            {/* No output */}
            {!result.stdout && !result.stderr && !result.compile_output && (
              <div className="text-gray-500 text-sm">No output</div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            Click "Run Code" to see output here
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsoleOutput;