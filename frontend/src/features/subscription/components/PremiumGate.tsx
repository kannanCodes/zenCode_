import { useNavigate } from 'react-router-dom';

interface Props {
  /** If true, renders children normally. If false, renders the upgrade gate. */
  hasAccess: boolean;
  /** Feature name shown in the gate UI, e.g. "AI Hints" */
  featureName: string;
  children: React.ReactNode;
}

/**
 * PremiumGate — wraps any premium feature.
 * When the user does not have access, shows a blurred overlay with an "Upgrade" CTA.
 */
const PremiumGate = ({ hasAccess, featureName, children }: Props) => {
  const navigate = useNavigate();

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred child preview */}
      <div className="pointer-events-none select-none opacity-30 blur-sm">{children}</div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#272b3a] z-10">
        {/* Lock Icon */}
        <div className="w-14 h-14 rounded-full bg-[#2D5FFF]/10 border border-[#2D5FFF]/30 flex items-center justify-center">
          <svg className="w-7 h-7 text-[#2D5FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <div className="text-center px-4">
          <p className="text-white font-semibold text-sm">{featureName} is a Premium Feature</p>
          <p className="text-gray-500 text-xs mt-1">Upgrade your plan to unlock this feature.</p>
        </div>

        <button
          onClick={() => navigate('/plans')}
          className="h-9 px-6 rounded-md bg-[#2D5FFF] hover:bg-blue-600 text-white text-xs font-bold transition-all hover:shadow-[0_0_16px_rgba(45,95,255,0.4)]"
        >
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
};

export default PremiumGate;
