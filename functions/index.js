// functions/index.js
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {initializeApp} = require("firebase-admin/app");
const {getDatabase} = require("firebase-admin/database");

initializeApp();

/**
 * Deletes RTDB items whose `expiresAt` <= now, in batches of 500.
 * @param {*} ref RTDB reference (collection root).
 * @param {number} now Epoch millis cutoff.
 * @return {Promise<void>}
 */
async function deleteByExpiresAt(ref, now) {
  const query = ref.orderByChild("expiresAt").endAt(now).limitToFirst(500);
  const snap = await query.get();

  if (!snap.exists()) {
    return;
  }

  /** @type {{[key: string]: null}} */
  const updates = {};
  snap.forEach((child) => {
    updates[child.key] = null;
  });

  await ref.update(updates);
  await deleteByExpiresAt(ref, now);
}

/**
 * Daily cleanup job at 03:00 Asia/Jerusalem.
 * @return {Promise<void>}
 */
exports.cleanupRtdb = onSchedule(
    {schedule: "0 3 * * *", timeZone: "Asia/Jerusalem"},
    async () => {
      const db = getDatabase();
      const now = Date.now();

      await deleteByExpiresAt(db.ref("chatMessages"), now);
      await deleteByExpiresAt(db.ref("sessions"), now);
    },
);
