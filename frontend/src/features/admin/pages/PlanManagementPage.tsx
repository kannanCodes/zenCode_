import { useState, useEffect } from 'react';
import { planService, type Plan } from '../services/plan.service';
import { showSuccess, showError } from '../../../shared/utils/toast.util';
import AdminSidebar from '../components/AdminSidebar';
import PlanModal from '../components/PlanModal';

const PlanManagementPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalPlan, setModalPlan] = useState<Plan | null>(null); // null = create, Plan = edit
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const data = await planService.getAdminPlans();
      setPlans(data);
    } catch (error) {
      showError('Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalPlan(null);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setModalPlan(plan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalPlan(null);
  };

  const handleModalSave = () => {
    loadPlans();
    closeModal();
  };

  const handleToggleStatus = async (plan: Plan) => {
    try {
      await planService.togglePlanStatus(plan._id);
      showSuccess(`Plan ${!plan.isActive ? 'activated' : 'deactivated'} successfully`);
      loadPlans();
    } catch (error) {
      showError('Failed to toggle plan status');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-[#0a0a0a] border-b border-[#1c1c1c] p-6">
          <div className="max-w-7xl flex items-center justify-between">
            <div>
              <h1 className="text-white text-3xl font-bold mb-2">Premium Plan Configuration</h1>
              <p className="text-gray-400">Manage platform subscription offerings</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-medium transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Plan
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-w-7xl">
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No plans configured yet</div>
            </div>
          ) : (
            <div className="space-y-6">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className="bg-[#0f0f0f] border border-[#2a2d3a] rounded-xl p-6 relative overflow-hidden"
                >
                  {/* Active Badge */}
                  {plan.isActive && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                        ACTIVE
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-primary)]">
                        {plan.billingCycle === 'monthly' ? 'Monthly Plan' : 'Annual Plan'}
                      </span>
                    </div>
                    <h2 className="text-white text-2xl font-bold mb-3">{plan.name}</h2>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white text-4xl font-bold">₹{plan.price}</span>
                      <span className="text-gray-400 text-lg">/ {plan.billingCycle === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">{plan.description}</p>

                  {/* Features */}
                  {plan.features && plan.features.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-white text-sm font-medium uppercase tracking-wide mb-3">Included Features</h3>
                      <div className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <div className="text-white text-sm font-medium">{feature.name}</div>
                              {feature.description && (
                                <div className="text-gray-500 text-xs mt-0.5">{feature.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Access Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {plan.access?.premiumProblems && (
                      <span className="px-2 py-1 rounded-md text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Premium Problems
                      </span>
                    )}
                    {plan.access?.aiHints && (
                      <span className="px-2 py-1 rounded-md text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        AI Hints
                      </span>
                    )}
                    {plan.access?.mentorBooking && (
                      <span className="px-2 py-1 rounded-md text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                        Mentor Booking
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-[#2a2d3a]">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="flex-1 h-11 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Plan
                    </button>
                    <button
                      onClick={() => handleToggleStatus(plan)}
                      className="h-11 px-6 rounded-lg border border-[#2a2d3a] text-white hover:bg-[#1a1a1a] transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      {plan.isActive ? 'Deactivate' : 'Activate'} Plan
                    </button>
                  </div>

                  {/* Footer Note */}
                  <div className="mt-4 pt-4 border-t border-[#2a2d3a] text-xs text-gray-500">
                    Subscription plans are managed by administrators. Changes affect new subscriptions only.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unified Plan Modal (Create or Edit) */}
      {isModalOpen && (
        <PlanModal
          plan={modalPlan ?? undefined}
          onClose={closeModal}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default PlanManagementPage;