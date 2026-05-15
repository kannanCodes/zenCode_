interface FunctionSignature {
  functionName: string;
  parameters: Array<{ name: string; type: string }>;
  returnType: string;
}

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface ProblemDescriptionProps {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples?: Example[];
  constraints?: string;
  tags?: string[];
  companyTags?: string[];
  functionSignature?: FunctionSignature;
  isPremium?: boolean;
}

const ProblemDescription = ({
  title,
  difficulty,
  description,
  examples,
  constraints,
  tags,
  companyTags,
  functionSignature,
  isPremium,
}: ProblemDescriptionProps) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#0a0a0a]">
      {/* Title and Difficulty */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-white text-2xl font-bold">{title}</h1>
          {isPremium && (
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`font-medium capitalize ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
          {tags && tags.length > 0 && (
            <>
              <span className="text-gray-600">|</span>
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded text-xs font-medium bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Company Tags */}
        {companyTags && companyTags.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 text-sm">Companies:</span>
            {companyTags.map((company, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300"
              >
                {company}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{description}</div>
      </div>

      {/* Function Signature */}
      {functionSignature && (
        <div className="mb-6">
          <h2 className="text-white text-lg font-bold mb-3">Function Signature</h2>
          <div className="bg-[#1a1a1a] border border-[#2a2d3a] rounded-lg p-4">
            <pre className="text-[var(--color-primary)] font-mono text-sm leading-relaxed overflow-x-auto">
              {`${functionSignature.functionName}(`}
              {functionSignature.parameters.map((param, idx) => (
                <span key={idx}>
                  {idx > 0 && ', '}
                  <span className="text-yellow-400">{param.name}</span>
                  <span className="text-gray-400">: </span>
                  <span className="text-green-400">{param.type}</span>
                </span>
              ))}
              {`) -> `}
              <span className="text-green-400">{functionSignature.returnType}</span>
            </pre>
          </div>
        </div>
      )}

      {/* Examples */}
      {examples && examples.length > 0 && (
        <div className="mb-6">
          <h2 className="text-white text-lg font-bold mb-4">Examples</h2>
          {examples.map((example, idx) => (
            <div key={idx} className="mb-4 bg-[#1a1a1a] border border-[#2a2d3a] rounded-lg p-4">
              <div className="font-bold text-white mb-2">Example {idx + 1}:</div>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400">Input: </span>
                  <code className="text-white font-mono">{example.input}</code>
                </div>
                <div>
                  <span className="text-gray-400">Output: </span>
                  <code className="text-white font-mono">{example.output}</code>
                </div>
                {example.explanation && (
                  <div>
                    <span className="text-gray-400">Explanation: </span>
                    <span className="text-gray-300">{example.explanation}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Constraints */}
      {constraints && (
        <div className="mb-6">
          <h2 className="text-white text-lg font-bold mb-3">Constraints</h2>
          <div className="bg-[#1a1a1a] border border-[#2a2d3a] rounded-lg p-4">
            <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">
              {constraints}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDescription;