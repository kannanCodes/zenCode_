import api from '../../../shared/lib/axios';
import type { MentorAvailability, UpsertAvailabilityPayload } from '../types/availability';

export const mentorAvailabilityApi = {
  getMyAvailability: async (): Promise<{ data: MentorAvailability }> => {
    const response = await api.get('/mentor/availability/me');
    return response.data;
  },

  upsertAvailability: async (payload: UpsertAvailabilityPayload): Promise<{ data: MentorAvailability }> => {
    const response = await api.put('/mentor/availability', payload);
    return response.data;
  },
};
