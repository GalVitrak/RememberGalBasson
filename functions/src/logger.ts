import { db } from "./index";

interface LogEntry {
  date: string; // Firestore Timestamp
  category: string; // 'candles', 'subscribers', 'events'
  action: string; // specific action taken
  details?: any; // additional context data
}

// Function to log activities
export const logActivity = async (
  category: string,
  action: string,
  details?: any
) => {
  try {
    const logEntry: LogEntry = {
      date: new Date().toLocaleString("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jerusalem",
      }),
      category,
      action,
      details,
    };

    await db
      .collection("activityLogs")
      .add(logEntry);
  } catch (error) {
    throw error;
  }
};

// Candles

export const logCandleActivity = {
  lit: async (
    candleId: string,
    details?: any
  ) => {
    await logActivity("candles", "lit_candle", {
      candleId,
      ...details,
    });
  },

  approved: async (
    candleId: string,
    details?: any
  ) => {
    await logActivity(
      "candles",
      "approved_candle",
      {
        candleId,
        ...details,
      }
    );
  },

  reported: async (
    candleId: string,
    details?: any
  ) => {
    await logActivity(
      "candles",
      "reported_candle",
      {
        candleId,
        reason: "user_report",
        ...details,
      }
    );
  },

  deleted: async (
    candleId: string,
    details?: any
  ) => {
    await logActivity(
      "candles",
      "deleted_candle",
      {
        candleId,
        ...details,
      }
    );
  },
};

// Subscribers

export const logSubscriberActivity = {
  subscribed: async (
    subscriberId: string,
    email: string,
    name: string,
    details?: any
  ) => {
    await logActivity(
      "subscribers",
      "subscribed",
      { subscriberId, email, name, ...details }
    );
  },

  unsubscribed: async (
    subscriberId: string,
    email: string,
    name: string,
    details?: any
  ) => {
    await logActivity(
      "subscribers",
      "unsubscribed",
      { subscriberId, email, ...details }
    );
  },
};

// Event Types

export const logEventTypeActivity = {
  added: async (
    eventTypeId: string,
    name: string,
    description: string,
    details?: any
  ) => {
    await logActivity(
      "event_types",
      "added_event_type",
      {
        eventTypeId,
        name,
        description,
        ...details,
      }
    );
  },

  updated: async (
    eventTypeId: string,
    name: string,
    description: string,
    details?: any
  ) => {
    await logActivity(
      "event_types",
      "updated_event_type",
      {
        eventTypeId,
        name,
        description,
        ...details,
      }
    );
  },

  deleted: async (
    eventTypeId: string,
    name: string,
    description: string,
    details?: any
  ) => {
    await logActivity(
      "event_types",
      "deleted_event_type",
      {
        eventTypeId,
        name,
        description,
        ...details,
      }
    );
  },
};

// Events

export const logEventActivity = {
  added: async (
    eventId: string,
    title: string,
    details?: any
  ) => {
    await logActivity("events", "added_event", {
      eventId,
      title,
      ...details,
    });
  },

  updated: async (
    eventId: string,
    title: string,
    details?: any
  ) => {
    await logActivity("events", "updated_event", {
      eventId,
      title,
      ...details,
    });
  },

  deleted: async (
    eventId: string,
    title: string,
    details?: any
  ) => {
    await logActivity("events", "deleted_event", {
      eventId,
      title,
      ...details,
    });
  },
};

// Forbidden Words

export const logForbiddenWordsActivity = {
  added: async (
    forbiddenWords: string,
    details?: any
  ) => {
    await logActivity(
      "forbidden_words",
      "added_forbidden_word",
      { forbiddenWords, ...details }
    );
  },

  deleted: async (
    forbiddenWord: string,
    details?: any
  ) => {
    await logActivity(
      "forbidden_words",
      "deleted_forbidden_word",
      { forbiddenWord, ...details }
    );
  },
};
