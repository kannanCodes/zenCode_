import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submissionService, type Submission } from '../services/submission.service';
import { showError } from '../../../shared/utils/toast.util';

const SubmissionsPage = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await submissionService.getMySubmissions();
      setSubmissions(data);
    } catch (error) {
      showError('Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-400 bg-green-500/10';
      case 'wrong_answer':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'runtime_error':
      case 'compilation_error':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-[#1c1c1c] p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">My Submissions</h1>
            <p className="text-gray-400">View your submission history</p>
          </div>
          <button
            onClick={() => navigate('/problems')}
            className="px-4 py-2 rounded-lg border border-[#2a2d3a] text-white hover:bg-[#1a1a1a] transition-all"
          >
            Back to Problems
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="max-w-7xl mx-auto p-6">
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No submissions yet</div>
            <button
              onClick={() => navigate('/problems')}
              className="px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-medium transition-all"
            >
              Start Solving Problems
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div
                key={sub._id}
                className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-lg p-4 hover:border-[var(--color-primary)]/50 transition-all cursor-pointer"
                onClick={() => navigate(`/problems/${sub.problemId}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sub.status)}`}>
                      {getStatusLabel(sub.status)}
                    </div>
                    <div className="text-white font-medium">{sub.language}</div>
                    {sub.time && (
                      <div className="text-gray-400 text-sm">Runtime: {sub.time}s</div>
                    )}
                    {sub.memory && (
                      <div className="text-gray-400 text-sm">Memory: {(sub.memory / 1024).toFixed(2)} MB</div>
                    )}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {new Date(sub.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionsPage;
