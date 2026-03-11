import { useSyncExternalStore } from 'react';

import type { Business, Queue, QueueEntry, QueueEntryStatus } from '@queueless/types';

export interface DemoProfileState {
  fullName: string;
  email: string;
  phone: string;
}

export interface DemoActiveSession {
  business: Business;
  queue: Queue;
  entry: QueueEntry;
  estimatedWaitMinutes: number;
}

export interface DemoHistoryItem {
  id: string;
  businessName: string;
  queueName: string;
  displayName: string;
  status: Extract<QueueEntryStatus, 'served' | 'cancelled' | 'no_show'>;
  joinedAt: string;
  completedAt: string;
}

interface DemoState {
  profile: DemoProfileState;
  businesses: Business[];
  queues: Queue[];
  queueLoads: Record<string, number>;
  activeSession: DemoActiveSession | null;
  history: DemoHistoryItem[];
}

const nowIso = () => new Date().toISOString();

const businesses: Business[] = [
  {
    id: 'biz-nordic-cut',
    owner_id: 'owner-1',
    name: 'Nordic Cut Barbershop',
    slug: 'nordic-cut',
    category: 'Barbershop',
    address: 'Norre Voldgade 20',
    city: 'Copenhagen',
    description: 'Walk-ins welcome. Fast fades and beard trims.',
    is_active: true,
    created_at: nowIso(),
  },
  {
    id: 'biz-city-clinic',
    owner_id: 'owner-2',
    name: 'CityCare Clinic',
    slug: 'citycare-clinic',
    category: 'Clinic',
    address: 'Frederiksborggade 15',
    city: 'Copenhagen',
    description: 'General consultation and same-day slots.',
    is_active: true,
    created_at: nowIso(),
  },
  {
    id: 'biz-blush-studio',
    owner_id: 'owner-3',
    name: 'Blush Beauty Studio',
    slug: 'blush-beauty-studio',
    category: 'Salon',
    address: 'Amagerbrogade 42',
    city: 'Copenhagen',
    description: 'Hair styling and makeup services.',
    is_active: true,
    created_at: nowIso(),
  },
];

const queues: Queue[] = [
  {
    id: 'queue-nordic-cut',
    business_id: 'biz-nordic-cut',
    name: 'Main Queue',
    status: 'open',
    avg_service_minutes: 15,
    created_at: nowIso(),
  },
  {
    id: 'queue-city-clinic',
    business_id: 'biz-city-clinic',
    name: 'Consultation Queue',
    status: 'open',
    avg_service_minutes: 20,
    created_at: nowIso(),
  },
  {
    id: 'queue-blush-studio',
    business_id: 'biz-blush-studio',
    name: 'Styling Queue',
    status: 'closed',
    avg_service_minutes: 25,
    created_at: nowIso(),
  },
];

let state: DemoState = {
  profile: {
    fullName: 'Demo Customer',
    email: 'demo.customer@queueless.app',
    phone: '+45 12 34 56 78',
  },
  businesses,
  queues,
  queueLoads: {
    'queue-nordic-cut': 4,
    'queue-city-clinic': 2,
    'queue-blush-studio': 0,
  },
  activeSession: null,
  history: [
    {
      id: 'history-1',
      businessName: 'Nordic Cut Barbershop',
      queueName: 'Main Queue',
      displayName: 'Demo Customer',
      status: 'served',
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 40).toISOString(),
    },
  ],
};

const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const setState = (updater: (previous: DemoState) => DemoState) => {
  state = updater(state);
  emit();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const addHistoryFromSession = (
  session: DemoActiveSession,
  status: Extract<QueueEntryStatus, 'served' | 'cancelled' | 'no_show'>,
): DemoHistoryItem => {
  return {
    id: `history-${session.entry.id}`,
    businessName: session.business.name,
    queueName: session.queue.name,
    displayName: session.entry.display_name,
    status,
    joinedAt: session.entry.joined_at,
    completedAt: nowIso(),
  };
};

export const demoActions = {
  joinQueue: (input: { businessId: string; displayName: string }) => {
    if (state.activeSession) {
      return { ok: false as const, error: 'You already have an active queue entry.' };
    }

    const business = state.businesses.find((item) => item.id === input.businessId);
    if (!business) {
      return { ok: false as const, error: 'Business was not found.' };
    }

    const queue = state.queues.find((item) => item.business_id === input.businessId);
    if (!queue) {
      return { ok: false as const, error: 'No queue is configured for this business.' };
    }

    if (queue.status !== 'open') {
      return { ok: false as const, error: 'This queue is currently closed.' };
    }

    const queueLoad = state.queueLoads[queue.id] ?? 0;
    const position = queueLoad + 1;
    const joinedAt = nowIso();

    const entry: QueueEntry = {
      id: `entry-${Date.now()}`,
      queue_id: queue.id,
      customer_id: 'demo-customer',
      display_name: input.displayName,
      source: 'app',
      status: 'waiting',
      position,
      joined_at: joinedAt,
      called_at: null,
      served_at: null,
      cancelled_at: null,
    };

    setState((previous) => ({
      ...previous,
      queueLoads: {
        ...previous.queueLoads,
        [queue.id]: queueLoad + 1,
      },
      activeSession: {
        business,
        queue,
        entry,
        estimatedWaitMinutes: position * queue.avg_service_minutes,
      },
    }));

    return { ok: true as const };
  },

  stepQueueForward: () => {
    if (!state.activeSession) {
      return;
    }

    setState((previous) => {
      if (!previous.activeSession) {
        return previous;
      }

      const currentPosition = previous.activeSession.entry.position;
      const nextPosition = Math.max(1, currentPosition - 1);

      return {
        ...previous,
        activeSession: {
          ...previous.activeSession,
          entry: {
            ...previous.activeSession.entry,
            position: nextPosition,
          },
          estimatedWaitMinutes: nextPosition * previous.activeSession.queue.avg_service_minutes,
        },
      };
    });
  },

  leaveQueue: () => {
    if (!state.activeSession) {
      return;
    }

    setState((previous) => {
      if (!previous.activeSession) {
        return previous;
      }

      const queueId = previous.activeSession.queue.id;
      const currentLoad = previous.queueLoads[queueId] ?? 1;

      return {
        ...previous,
        queueLoads: {
          ...previous.queueLoads,
          [queueId]: Math.max(0, currentLoad - 1),
        },
        history: [addHistoryFromSession(previous.activeSession, 'cancelled'), ...previous.history],
        activeSession: null,
      };
    });
  },

  completeActiveQueue: (status: Extract<QueueEntryStatus, 'served' | 'no_show'>) => {
    if (!state.activeSession) {
      return;
    }

    setState((previous) => {
      if (!previous.activeSession) {
        return previous;
      }

      const queueId = previous.activeSession.queue.id;
      const currentLoad = previous.queueLoads[queueId] ?? 1;

      return {
        ...previous,
        queueLoads: {
          ...previous.queueLoads,
          [queueId]: Math.max(0, currentLoad - 1),
        },
        history: [addHistoryFromSession(previous.activeSession, status), ...previous.history],
        activeSession: null,
      };
    });
  },

  updateProfile: (profile: Partial<DemoProfileState>) => {
    setState((previous) => ({
      ...previous,
      profile: {
        ...previous.profile,
        ...profile,
      },
    }));
  },
};

export const useDemoStore = <T>(selector: (snapshot: DemoState) => T): T => {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
};
