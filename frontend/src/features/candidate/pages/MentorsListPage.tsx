import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateMentorApi } from '../services/mentor.service';
import type { PublicMentorResponse } from '../services/mentor.service';
import { showError } from '../../../shared/utils/toast.util';
import Navbar from '../../../shared/components/Navbar';

const MentorsListPage = () => {
  const [mentors, setMentors] = useState<PublicMentorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const fetchMentors = async () => {
      try {
        setIsLoading(true);
        const res = await candidateMentorApi.getMentors();
        if (!cancelled) setMentors(res.data);
      } catch (err: unknown) {
        if (!cancelled) {
          console.error(err);
          showError('Failed to load mentors');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchMentors();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-10">
        <header className="mb-12">
          <h1 className="text-4xl font-bold font-mono tracking-tight text-[var(--color-primary)] mb-4">
            Discover Mentors
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Connect with experienced software engineers. Book 1-on-1 sessions to level up your coding skills, get architecture advice, and prepare for interviews.
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#2a2d3a] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
          </div>
        ) : mentors.length === 0 ? (
          <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">No mentors available</h2>
            <p className="text-gray-400">Please check back later when mentors come online.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div 
                key={mentor.id}
                className="bg-[#161922] border border-[#272b3a] rounded-2xl overflow-hidden hover:border-[var(--color-primary)] transition-all group flex flex-col h-full shadow-[0_0_20px_rgba(0,0,0,0.2)]"
              >
                {/* Header Profile Area */}
                <div className="p-6 pb-0 flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-full bg-[#272b3a] flex items-center justify-center overflow-hidden shrink-0">
                    {mentor.avatar ? (
                      <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">
                        {mentor.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[var(--color-primary)] transition-colors">
                      {mentor.name}
                    </h3>
                    <p className="text-sm text-[var(--color-primary)] font-medium mb-1">
                      {mentor.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-white">{mentor.stats.rating?.toFixed(1) || '5.0'}</span>
                      <span>({mentor.stats.totalSessions} sessions)</span>
                    </div>
                  </div>
                </div>

                {/* Bio & Expertise */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
                    {mentor.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {mentor.expertise.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-[#272b3a] text-xs font-medium text-gray-300">
                        {skill}
                      </span>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <span className="px-2.5 py-1 rounded bg-[#272b3a] text-xs font-medium text-gray-500">
                        +{mentor.expertise.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#272b3a]">
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-400">Next Available</span>
                      <span className="text-white font-medium">
                        {mentor.availabilityPreview.nextAvailableSlot || 'Check calendar'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/candidate/mentors/${mentor.id}`)}
                      className="w-full py-3 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-colors shadow-[0_0_15px_rgba(45,95,255,0.2)] hover:shadow-[0_0_25px_rgba(45,95,255,0.4)]"
                    >
                      View Profile & Book
                    </button>
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

export default MentorsListPage;
