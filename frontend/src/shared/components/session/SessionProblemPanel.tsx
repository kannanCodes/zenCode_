import { useEffect, useMemo, useState } from 'react';
import ProblemDescription from '../../../features/candidate/components/ProblemDescription';
import type { Problem } from '../../../features/candidate/services/problem.service';
import { sessionWorkspaceService } from '../../services/sessionWorkspace.service';
import type { SessionWorkspace } from '../../services/sessionWorkspace.service';
import { showError } from '../../utils/toast.util';

interface SessionProblemPanelProps {
  roomId: string;
  problem: Problem | null;
  canChangeProblem: boolean;
  onProblemSelected: (workspace: SessionWorkspace) => void;
}

const SessionProblemPanel = ({
  roomId,
  problem,
  canChangeProblem,
  onProblemSelected,
}: SessionProblemPanelProps) => {
  const [search, setSearch] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(!problem && canChangeProblem);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<Problem[]>([]);

  const difficultyClass = useMemo(() => {
    if (!problem) return '';
    if (problem.difficulty === 'easy') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (problem.difficulty === 'medium') return 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-300 bg-red-500/10 border-red-500/20';
  }, [problem]);

  useEffect(() => {
    if (!isPickerOpen || !canChangeProblem) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await sessionWorkspaceService.listProblems(roomId, search);
        if (!cancelled) setOptions(data);
      } catch {
        if (!cancelled) showError('Unable to load problems');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [canChangeProblem, isPickerOpen, roomId, search]);

  const handleSelect = async (problemId: string) => {
    setIsLoading(true);
    try {
      const workspace = await sessionWorkspaceService.selectProblem(roomId, problemId);
      onProblemSelected(workspace);
      setIsPickerOpen(false);
    } catch (error: unknown) {
      const message =
        error instanceof Object && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      showError(message || 'Unable to select problem');
    } finally {
      setIsLoading(false);
    }
  };

  if (!problem) {
    return (
      <div className="h-full bg-[#0a0a0a] flex flex-col">
        <div className="h-12 border-b border-[#272b3a] px-4 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Problem</span>
        </div>
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="border border-dashed border-[#2a2d3a] rounded-lg p-5 text-center bg-[#111111]">
            <div className="text-white font-bold mb-2">No problem selected</div>
            <p className="text-sm text-gray-500">
              {canChangeProblem ? 'Choose a problem to start the shared interview workspace.' : 'Waiting for the mentor to choose a problem.'}
            </p>
          </div>
          {canChangeProblem && (
            <div className="mt-5">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search problems..."
                className="w-full h-10 rounded bg-[#151515] border border-[#2a2d3a] px-3 text-sm text-white outline-none focus:border-[var(--color-primary)]"
              />
              <ProblemOptions options={options} isLoading={isLoading} onSelect={handleSelect} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0a0a0a] flex flex-col">
      <div className="h-12 border-b border-[#272b3a] px-4 flex items-center gap-3 shrink-0">
        <div className="min-w-0 flex-1 flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">#{problem._id.slice(-4)}</span>
          <span className="text-sm font-bold text-white truncate">{problem.title}</span>
          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${difficultyClass}`}>
            {problem.difficulty}
          </span>
        </div>
        {canChangeProblem && (
          <button
            onClick={() => setIsPickerOpen((value) => !value)}
            className="h-8 px-3 rounded border border-[#2a2d3a] text-xs text-gray-300 hover:text-white hover:bg-[#1a1a1a] transition-colors"
          >
            Change
          </button>
        )}
      </div>

      {isPickerOpen && canChangeProblem && (
        <div className="border-b border-[#272b3a] bg-[#111111] p-3 shrink-0">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search problems..."
            className="w-full h-9 rounded bg-[#0a0a0a] border border-[#2a2d3a] px-3 text-sm text-white outline-none focus:border-[var(--color-primary)]"
          />
          <ProblemOptions options={options} isLoading={isLoading} onSelect={handleSelect} compact />
        </div>
      )}

      <div className="flex-1 min-h-0">
        <ProblemDescription {...problem} />
      </div>
    </div>
  );
};

const ProblemOptions = ({
  options,
  isLoading,
  onSelect,
  compact = false,
}: {
  options: Problem[];
  isLoading: boolean;
  onSelect: (problemId: string) => void;
  compact?: boolean;
}) => {
  if (isLoading) {
    return <div className="py-4 text-center text-sm text-gray-500">Loading problems...</div>;
  }

  if (options.length === 0) {
    return <div className="py-4 text-center text-sm text-gray-500">No matching problems</div>;
  }

  return (
    <div className={`mt-3 space-y-2 overflow-y-auto ${compact ? 'max-h-44' : 'max-h-96'}`}>
      {options.map((option) => (
        <button
          key={option._id}
          onClick={() => onSelect(option._id)}
          className="w-full text-left rounded border border-[#2a2d3a] bg-[#151515] hover:border-[var(--color-primary)] hover:bg-[#1a1d26] transition-colors p-3"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-white truncate">{option.title}</span>
            <span className="text-[10px] uppercase text-gray-500">{option.difficulty}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {option.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded bg-[#222631] text-[10px] text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
};

export default SessionProblemPanel;
