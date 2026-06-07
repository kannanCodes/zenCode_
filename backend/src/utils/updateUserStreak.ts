import User from '../infrastructure/database/models/user.model';
import { logger } from '../shared/utils/Logger';

/**
 * Updates the streak for a user after an accepted submission.
 *
 * Rules (all comparisons are UTC date strings "YYYY-MM-DD"):
 *  - If lastActiveDate === today  → already counted today, no-op (idempotent)
 *  - If lastActiveDate === yesterday → consecutive day, streakCount++
 *  - Anything else (first ever / gap)  → reset streakCount to 1
 *  - bestStreak is updated whenever streakCount exceeds it
 */
export async function updateUserStreak(userId: string): Promise<void> {
  try {
    const today = new Date();
    const todayStr = today.toISOString().substring(0, 10); // "YYYY-MM-DD" UTC

    const user = await User.findById(userId).select(
      'streakCount bestStreak lastActiveDate'
    );

    if (!user) return;

    const lastStr = user.lastActiveDate
      ? user.lastActiveDate.toISOString().substring(0, 10)
      : null;

    // Idempotency guard — already updated for today
    if (lastStr === todayStr) return;

    const yesterdayStr = (() => {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - 1);
      return d.toISOString().substring(0, 10);
    })();

    let newStreak: number;
    if (lastStr === yesterdayStr) {
      // Consecutive day
      newStreak = user.streakCount + 1;
    } else {
      // Gap or first time
      newStreak = 1;
    }

    const newBest = Math.max(user.bestStreak, newStreak);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          streakCount: newStreak,
          bestStreak: newBest,
          lastActiveDate: today,
        },
      }
    );

    logger.info(
      `[Streak] userId=${userId} streak=${newStreak} best=${newBest} lastActive=${todayStr}`
    );
  } catch (err) {
    // Non-fatal — never block the submission response
    logger.error('[Streak] updateUserStreak failed (non-fatal):', err);
  }
}
