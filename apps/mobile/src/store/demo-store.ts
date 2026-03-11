import {
  getQueueEntryGuest,
  joinQueueGuest,
  leaveQueueGuest,
  listPublicBusinesses,
  type GuestQueueEntrySnapshot,
  type PublicBusinessSnapshot,
} from '@queueless/api';
import type { Business, Queue, QueueEntryStatus } from '@queueless/types';
import { useSyncExternalStore } from 'react';

import { supabase } from '@/lib/supabase';

export interface DemoProfileState {
  fullName: string;
  email: string;
  phone: string;
}

export interface DemoActiveSession {
  entryId: string;
  guestToken: string;
  queueId: string;
  businessId: string;
  displayName: string;
  status: QueueEntryStatus;
  position: number;
  joinedAt: string;
  queueName: string;
  businessName: string;
  avgServiceMinutes: number;
  estimatedWaitMinutes: number;
  calledAt: string | null;
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
  isLoadingBusinesses: boolean;
  isMutatingQueue: boolean;
  isSyncingActive: boolean;
  hydrated: boolean;
  lastError: string | null;
}

const nowIso = () => new Date().toISOString();

const fallbackBusinesses: Business[] = [
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

const fallbackQueues: Queue[] = [
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

const fallbackQueueLoads: Record<string, number> = {
  'queue-nordic-cut': 4,
  'queue-city-clinic': 2,
  'queue-blush-studio': 0,
};

let state: DemoState = {
  profile: {
    fullName: 'Demo Customer',
    email: 'demo.customer@queueless.app',
    phone: '+45 12 34 56 78',
  },
  businesses: [],
  queues: [],
  queueLoads: {},
  activeSession: null,
  history: [],
  isLoadingBusinesses: false,
  isMutatingQueue: false,
  isSyncingActive: false,
  hydrated: false,
  lastError: null,
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

const errorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

const mapSnapshotToBusiness = (snapshot: PublicBusinessSnapshot): Business => {
  return {
    id: snapshot.business_id,
    owner_id: snapshot.owner_id,
    name: snapshot.name,
    slug: snapshot.slug,
    category: snapshot.category,
    address: snapshot.address,
    city: snapshot.city,
    description: snapshot.description,
    is_active: snapshot.is_active,
    created_at: snapshot.business_created_at,
  };
};

const mapSnapshotToQueue = (snapshot: PublicBusinessSnapshot): Queue | null => {
  if (
    !snapshot.queue_id ||
    !snapshot.queue_name ||
    !snapshot.queue_status ||
    !snapshot.queue_created_at
  ) {
    return null;
  }

  return {
    id: snapshot.queue_id,
    business_id: snapshot.business_id,
    name: snapshot.queue_name,
    status: snapshot.queue_status,
    avg_service_minutes: snapshot.avg_service_minutes ?? 15,
    created_at: snapshot.queue_created_at,
  };
};

const mapSnapshotToActiveSession = (snapshot: GuestQueueEntrySnapshot): DemoActiveSession => {
  return {
    entryId: snapshot.entry_id,
    guestToken: snapshot.guest_token,
    queueId: snapshot.queue_id,
    businessId: snapshot.business_id,
    displayName: snapshot.display_name,
    status: snapshot.status,
    position: snapshot.position,
    joinedAt: snapshot.joined_at,
    queueName: snapshot.queue_name,
    businessName: snapshot.business_name,
    avgServiceMinutes: snapshot.avg_service_minutes,
    estimatedWaitMinutes: snapshot.estimated_wait_minutes,
    calledAt: snapshot.called_at,
  };
};

const addHistoryFromSession = (
  session: DemoActiveSession,
  status: Extract<QueueEntryStatus, 'served' | 'cancelled' | 'no_show'>,
): DemoHistoryItem => {
  return {
    id: `history-${session.entryId}`,
    businessName: session.businessName,
    queueName: session.queueName,
    displayName: session.displayName,
    status,
    joinedAt: session.joinedAt,
    completedAt: new Date().toISOString(),
  };
};

const loadBusinesses = async ({ withLoading }: { withLoading: boolean }) => {
  if (withLoading) {
    setState((previous) => ({
      ...previous,
      isLoadingBusinesses: true,
      lastError: null,
    }));
  }

  if (!supabase) {
    setState((previous) => ({
      ...previous,
      businesses: fallbackBusinesses,
      queues: fallbackQueues,
      queueLoads: fallbackQueueLoads,
      hydrated: true,
      isLoadingBusinesses: false,
      lastError: null,
    }));
    return;
  }

  try {
    const snapshots = await listPublicBusinesses(supabase);
    const businesses = snapshots.map(mapSnapshotToBusiness);
    const queues = snapshots
      .map(mapSnapshotToQueue)
      .filter((queue): queue is Queue => queue !== null);

    const queueLoads: Record<string, number> = {};
    snapshots.forEach((snapshot) => {
      if (snapshot.queue_id) {
        queueLoads[snapshot.queue_id] = snapshot.waiting_count;
      }
    });

    setState((previous) => ({
      ...previous,
      businesses,
      queues,
      queueLoads,
      hydrated: true,
      isLoadingBusinesses: false,
      lastError: null,
    }));
  } catch (error) {
    setState((previous) => ({
      ...previous,
      hydrated: true,
      isLoadingBusinesses: false,
      lastError: errorMessage(error, 'Unable to load businesses from Supabase.'),
    }));
  }
};

export const demoActions = {
  bootstrap: async () => {
    if (state.hydrated) {
      return;
    }
    await loadBusinesses({ withLoading: true });
  },

  refreshBusinesses: async () => {
    await loadBusinesses({ withLoading: false });
  },

  joinQueue: async (input: { businessId: string; displayName: string }) => {
    if (state.activeSession) {
      return { ok: false as const, error: 'You already have an active queue entry.' };
    }

    const queue = state.queues.find((item) => item.business_id === input.businessId);
    if (!queue) {
      return { ok: false as const, error: 'No queue is configured for this business.' };
    }

    if (queue.status !== 'open') {
      return { ok: false as const, error: 'This queue is currently closed.' };
    }

    setState((previous) => ({ ...previous, isMutatingQueue: true, lastError: null }));

    if (!supabase) {
      const currentLoad = state.queueLoads[queue.id] ?? 0;
      const position = currentLoad + 1;
      const activeSession: DemoActiveSession = {
        entryId: `local-entry-${Date.now()}`,
        guestToken: `local-guest-${Date.now()}`,
        queueId: queue.id,
        businessId: queue.business_id,
        displayName: input.displayName,
        status: 'waiting',
        position,
        joinedAt: nowIso(),
        queueName: queue.name,
        businessName:
          state.businesses.find((item) => item.id === queue.business_id)?.name ?? 'Business',
        avgServiceMinutes: queue.avg_service_minutes,
        estimatedWaitMinutes: position * queue.avg_service_minutes,
        calledAt: null,
      };

      setState((previous) => ({
        ...previous,
        activeSession,
        isMutatingQueue: false,
        queueLoads: {
          ...previous.queueLoads,
          [queue.id]: position,
        },
      }));

      return { ok: true as const };
    }

    try {
      const joined = await joinQueueGuest(supabase, {
        queueId: queue.id,
        displayName: input.displayName,
      });

      const activeSession = mapSnapshotToActiveSession(joined);

      setState((previous) => ({
        ...previous,
        activeSession,
        isMutatingQueue: false,
        queueLoads: {
          ...previous.queueLoads,
          [queue.id]: Math.max(previous.queueLoads[queue.id] ?? 0, joined.position),
        },
      }));

      return { ok: true as const };
    } catch (error) {
      const message = errorMessage(error, 'Unable to join queue right now.');
      setState((previous) => ({
        ...previous,
        isMutatingQueue: false,
        lastError: message,
      }));
      return { ok: false as const, error: message };
    }
  },

  refreshActiveSession: async () => {
    if (!state.activeSession) {
      return;
    }

    setState((previous) => ({ ...previous, isSyncingActive: true, lastError: null }));

    if (!supabase) {
      setState((previous) => {
        if (!previous.activeSession) {
          return {
            ...previous,
            isSyncingActive: false,
          };
        }

        const nextPosition = Math.max(1, previous.activeSession.position - 1);
        return {
          ...previous,
          activeSession: {
            ...previous.activeSession,
            position: nextPosition,
            status: nextPosition <= 1 ? 'called' : 'waiting',
            calledAt: nextPosition <= 1 ? nowIso() : null,
            estimatedWaitMinutes: nextPosition * previous.activeSession.avgServiceMinutes,
          },
          isSyncingActive: false,
        };
      });

      return;
    }

    try {
      const snapshot = await getQueueEntryGuest(supabase, {
        entryId: state.activeSession.entryId,
        guestToken: state.activeSession.guestToken,
      });

      if (!snapshot) {
        setState((previous) => ({
          ...previous,
          activeSession: null,
          isSyncingActive: false,
        }));
        await loadBusinesses({ withLoading: false });
        return;
      }

      const activeSession = mapSnapshotToActiveSession(snapshot);

      if (snapshot.status === 'waiting' || snapshot.status === 'called') {
        setState((previous) => ({
          ...previous,
          activeSession,
          isSyncingActive: false,
        }));
      } else {
        setState((previous) => ({
          ...previous,
          activeSession: null,
          history: [
            addHistoryFromSession(
              activeSession,
              snapshot.status as 'served' | 'cancelled' | 'no_show',
            ),
            ...previous.history,
          ],
          isSyncingActive: false,
        }));
      }

      await loadBusinesses({ withLoading: false });
    } catch (error) {
      setState((previous) => ({
        ...previous,
        isSyncingActive: false,
        lastError: errorMessage(error, 'Unable to refresh queue status.'),
      }));
    }
  },

  leaveQueue: async () => {
    if (!state.activeSession) {
      return false;
    }

    const activeSession = state.activeSession;
    setState((previous) => ({ ...previous, isMutatingQueue: true, lastError: null }));

    if (!supabase) {
      setState((previous) => ({
        ...previous,
        activeSession: null,
        history: [addHistoryFromSession(activeSession, 'cancelled'), ...previous.history],
        isMutatingQueue: false,
        queueLoads: {
          ...previous.queueLoads,
          [activeSession.queueId]: Math.max(
            0,
            (previous.queueLoads[activeSession.queueId] ?? 1) - 1,
          ),
        },
      }));
      return true;
    }

    try {
      const didLeave = await leaveQueueGuest(supabase, {
        entryId: activeSession.entryId,
        guestToken: activeSession.guestToken,
      });

      if (!didLeave) {
        setState((previous) => ({
          ...previous,
          isMutatingQueue: false,
          lastError: 'Queue entry was already closed.',
        }));
        return false;
      }

      setState((previous) => ({
        ...previous,
        activeSession: null,
        history: [addHistoryFromSession(activeSession, 'cancelled'), ...previous.history],
        isMutatingQueue: false,
      }));

      await loadBusinesses({ withLoading: false });
      return true;
    } catch (error) {
      setState((previous) => ({
        ...previous,
        isMutatingQueue: false,
        lastError: errorMessage(error, 'Unable to leave queue right now.'),
      }));
      return false;
    }
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

  clearLastError: () => {
    setState((previous) => ({
      ...previous,
      lastError: null,
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
