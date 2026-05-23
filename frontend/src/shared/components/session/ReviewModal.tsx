import { useState } from 'react';
import { mentorReviewApi } from '../../../features/candidate/services/review.service';
import { showError, showSuccess } from '../../utils/toast.util';

interface ReviewModalProps {
  bookingId: string;
  mentorName: string;
  onClose: () => void;
  onSubmitted: () => void;
}

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <svg
            className={`w-10 h-10 transition-colors ${
              star <= (hovered || value) ? 'text-yellow-400' : 'text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const LABEL_MAP: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
};

const ReviewModal = ({ bookingId, mentorName, onClose, onSubmitted }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      showError('Please select a rating');
      return;
    }
    if (feedback.trim().length < 10) {
      showError('Please write at least 10 characters of feedback');
      return;
    }

    try {
      setIsSubmitting(true);
      await mentorReviewApi.submitReview({ bookingId, rating, feedback: feedback.trim() });
      showSuccess('Review submitted! Thank you for your feedback.');
      onSubmitted();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#111827] border border-[#272b3a] rounded-2xl shadow-[0_0_60px_rgba(45,95,255,0.15)] overflow-hidden">
        {/* Gradient top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[var(--color-primary)] to-purple-500" />

        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-1">Rate Your Session</h2>
          <p className="text-gray-400 text-sm mb-8">
            How was your session with <span className="text-white font-semibold">{mentorName}</span>?
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="text-center">
              <StarRating value={rating} onChange={setRating} />
              <p className={`mt-3 text-sm font-semibold transition-colors ${rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                {rating ? LABEL_MAP[rating] : 'Select a rating'}
              </p>
            </div>

            {/* Feedback Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Your Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                placeholder="Share what you learned and how the mentor helped you..."
                className="w-full bg-[#1a1d26] border border-[#2a2d3a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
              />
              <p className="text-xs text-gray-600 mt-1 text-right">{feedback.length}/500</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-[#2a2d3a] text-gray-400 hover:text-white hover:bg-[#1a1d26] transition-all text-sm font-medium"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all shadow-[0_0_20px_rgba(45,95,255,0.3)] text-sm"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
