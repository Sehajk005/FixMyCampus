// Firebase path characters that must be sanitized
const FIREBASE_PATH_UNSAFE = /[.#$[\]]/g;
const sanitizePath = (location) => location.replace(FIREBASE_PATH_UNSAFE, '_');

// ─────────────────────────────────────────────────────────────
// TEST ENVIRONMENT — export no-op stubs, skip Firebase entirely
// ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'test') {
  const noop = async () => {};
  module.exports = {
    syncTicketToFeed:     noop,
    updateTicketInFeed:   noop,
    removeTicketFromFeed: noop,
    upvoteTicket:         async () => ({ upvotes: 0 }),
    incrementHeatmap:     noop,
    decrementHeatmap:     noop,
  };

// ─────────────────────────────────────────────────────────────
// PRODUCTION / DEVELOPMENT — real Firebase implementations
// Using const arrow functions (not function declarations) inside
// this block so no-inner-declarations never fires.
// ─────────────────────────────────────────────────────────────
} else {
  const { db } = require('../config/firebase');

  const incrementHeatmap = async (location) => {
    if (!location) return;
    const escapedLoc = sanitizePath(location);
    try {
      await db.ref(`heatmap/${escapedLoc}`).transaction((count) => (count || 0) + 1);
    } catch (err) {
      console.error(`❌ [Firebase] Failed tracking heatmap for ${escapedLoc}:`, err.message);
    }
  };

  const decrementHeatmap = async (location) => {
    if (!location) return;
    const escapedLoc = sanitizePath(location);
    try {
      await db.ref(`heatmap/${escapedLoc}`).transaction((count) => {
        if (!count || count <= 0) return 0;
        return count - 1;
      });
    } catch (err) {
      console.error(`❌ [Firebase] Failed tracking heatmap for ${escapedLoc}:`, err.message);
    }
  };

  const syncTicketToFeed = async (ticket) => {
    try {
      if (!ticket.title || !ticket.title.trim()) {
        console.warn(`⚠️ [Firebase] Skipping feed sync for ticket ${ticket.id} — no title`);
        return;
      }
      await db.ref(`feed/${ticket.id}`).set({
        title:      ticket.title,
        category:   ticket.category,
        location:   ticket.location,
        status:     ticket.status,
        priority:   ticket.priority,
        upvotes:    0,
        updated_at: new Date().toISOString(),
      });
      await incrementHeatmap(ticket.location);
      console.log(`📡 [Firebase] Synced ticket ${ticket.id} to feed`);
    } catch (error) {
      console.error(`❌ [Firebase] Failed to sync ticket ${ticket.id}:`, error.message);
    }
  };

  const updateTicketInFeed = async (ticket) => {
    try {
      await db.ref(`feed/${ticket.id}`).update({
        status:     ticket.status,
        priority:   ticket.priority,
        updated_at: new Date().toISOString(),
      });
      console.log(`📡 [Firebase] Updated ticket ${ticket.id} in feed`);
    } catch (error) {
      console.error(`❌ [Firebase] Failed to update ticket ${ticket.id}:`, error.message);
    }
  };

  const removeTicketFromFeed = async (ticketId) => {
    try {
      await db.ref(`feed/${ticketId}`).remove();
      console.log(`📡 [Firebase] Removed ticket ${ticketId} from feed`);
    } catch (error) {
      console.error(`❌ [Firebase] Failed to remove ticket ${ticketId}:`, error.message);
    }
  };

  const upvoteTicket = async (ticketId, userId) => {
    try {
      const feedRef = db.ref(`feed/${ticketId}`);
      const result  = await feedRef.transaction((currentData) => {
        if (currentData === null) return currentData;
        if (!currentData.upvoters) currentData.upvoters = {};

        // Abort transaction if user already upvoted
        if (userId && currentData.upvoters[userId]) return;

        if (userId) currentData.upvoters[userId] = true;
        currentData.upvotes    = (currentData.upvotes || 0) + 1;
        currentData.updated_at = new Date().toISOString();
        return currentData;
      });

      if (result.committed) {
        console.log(`📡 [Firebase] User ${userId} upvoted ticket ${ticketId}`);
        return result.snapshot.val();
      }

      console.log(`ℹ️ [Firebase] User ${userId} already upvoted or ticket missing`);
      return { alreadyUpvoted: true };
    } catch (error) {
      console.error(`❌ [Firebase] Failed to upvote ticket ${ticketId}:`, error.message);
      throw error;
    }
  };

  module.exports = {
    syncTicketToFeed,
    updateTicketInFeed,
    removeTicketFromFeed,
    upvoteTicket,
    incrementHeatmap,
    decrementHeatmap,
  };
}