import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { INotification, NotificationSocketPayload } from '../../features/notification/types/notification.types';
import { notificationApi } from '../../features/notification/services/notification.service';
import type { RootState } from '../index';

// ── State ─────────────────────────────────────────────────────────────────────

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount:   0,
  isLoading:     false,
  hasMore:       true,
  currentPage:   1,
};

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}) => {
    const response = await notificationApi.getNotifications(page, limit);
    return { data: response.data, page, limit };
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async () => {
    const response = await notificationApi.getUnreadCount();
    return response.data.count;
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId: string) => {
    await notificationApi.markAsRead(notificationId);
    return notificationId;
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async () => {
    await notificationApi.markAllAsRead();
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Prepend a new real-time notification from socket.
     * Also increments unread count (socket event does not guarantee isRead state).
     */
    prependSocketNotification: (state, action: PayloadAction<NotificationSocketPayload>) => {
      const incoming = action.payload;
      // Avoid duplicates if the REST fetch and socket both deliver the same notification
      const alreadyExists = state.notifications.some((n) => n._id === incoming._id);
      if (!alreadyExists) {
        state.notifications.unshift(incoming as INotification);
        state.unreadCount += 1;
      }
    },

    /**
     * Reset notification state on logout.
     */
    clearNotifications: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ── fetchNotifications ────────────────────────────────────────────────
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, page, limit } = action.payload;

        if (page === 1) {
          // Fresh load — replace
          state.notifications = data;
        } else {
          // Pagination — append (deduplicated)
          const existingIds = new Set(state.notifications.map((n) => n._id));
          const newItems = data.filter((n) => !existingIds.has(n._id));
          state.notifications.push(...newItems);
        }

        state.currentPage = page;
        state.hasMore = data.length === limit;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.isLoading = false;
      })

      // ── fetchUnreadCount ──────────────────────────────────────────────────
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // ── markNotificationRead ──────────────────────────────────────────────
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        const notification = state.notifications.find((n) => n._id === id);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // ── markAllNotificationsRead ──────────────────────────────────────────
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => { n.isRead = true; });
        state.unreadCount = 0;
      });
  },
});

export const { prependSocketNotification, clearNotifications } = notificationSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectNotifications   = (state: RootState) => state.notifications.notifications;
export const selectUnreadCount     = (state: RootState) => state.notifications.unreadCount;
export const selectNotificationLoading = (state: RootState) => state.notifications.isLoading;
export const selectHasMoreNotifications = (state: RootState) => state.notifications.hasMore;

export default notificationSlice.reducer;
