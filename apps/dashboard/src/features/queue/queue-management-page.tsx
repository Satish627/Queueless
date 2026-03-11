'use client';

import { useMemo, useState } from 'react';

import { PageShell } from '@/components/page-shell';

type QueueEntryStatus = 'waiting' | 'called' | 'served' | 'cancelled' | 'no_show';

interface QueueRow {
  id: string;
  displayName: string;
  source: 'app' | 'walk_in';
  status: QueueEntryStatus;
  joinedAt: string;
  position: number;
}

const seedRows: QueueRow[] = [
  {
    id: 'entry-1',
    displayName: 'Alex',
    source: 'app',
    status: 'waiting',
    joinedAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    position: 1,
  },
  {
    id: 'entry-2',
    displayName: 'Mia',
    source: 'walk_in',
    status: 'waiting',
    joinedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    position: 2,
  },
  {
    id: 'entry-3',
    displayName: 'Noah',
    source: 'app',
    status: 'called',
    joinedAt: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    position: 3,
  },
];

const recomputePositions = (rows: QueueRow[]): QueueRow[] => {
  let nextPosition = 1;
  return rows.map((row) => {
    if (row.status === 'waiting' || row.status === 'called') {
      const updated = { ...row, position: nextPosition };
      nextPosition += 1;
      return updated;
    }
    return { ...row, position: 0 };
  });
};

export function QueueManagementPage() {
  const [rows, setRows] = useState<QueueRow[]>(seedRows);
  const [walkInName, setWalkInName] = useState('');
  const [queueStatus, setQueueStatus] = useState<'open' | 'closed'>('open');

  const activeRows = useMemo(
    () => rows.filter((row) => row.status === 'waiting' || row.status === 'called'),
    [rows],
  );

  const callNext = () => {
    setRows((previous) => {
      const firstWaiting = previous.find((row) => row.status === 'waiting');
      if (!firstWaiting) {
        return previous;
      }
      return previous.map((row) =>
        row.id === firstWaiting.id
          ? {
              ...row,
              status: 'called',
            }
          : row,
      );
    });
  };

  const addWalkIn = () => {
    const normalized = walkInName.trim();
    if (!normalized || queueStatus !== 'open') {
      return;
    }

    setRows((previous) => {
      const nextRow: QueueRow = {
        id: `entry-${Date.now()}`,
        displayName: normalized,
        source: 'walk_in',
        status: 'waiting',
        joinedAt: new Date().toISOString(),
        position: 999,
      };
      return recomputePositions([...previous, nextRow]);
    });
    setWalkInName('');
  };

  const markStatus = (id: string, status: Exclude<QueueEntryStatus, 'waiting' | 'called'>) => {
    setRows((previous) => {
      const updated = previous.map((row) =>
        row.id === id
          ? {
              ...row,
              status,
            }
          : row,
      );
      return recomputePositions(updated);
    });
  };

  const waitingCount = activeRows.filter((row) => row.status === 'waiting').length;
  const calledCount = activeRows.filter((row) => row.status === 'called').length;

  return (
    <PageShell
      title="Queue management"
      description="Monitor waiting customers and process queue actions."
    >
      <div className="space-y-5 text-sm text-slate-700">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1">Status: {queueStatus}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Waiting: {waitingCount}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Called: {calledCount}</span>
          <button
            className="rounded-md border border-slate-300 px-3 py-1 font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => setQueueStatus((previous) => (previous === 'open' ? 'closed' : 'open'))}
            type="button"
          >
            {queueStatus === 'open' ? 'Close queue' : 'Open queue'}
          </button>
          <button
            className="rounded-md bg-brand-700 px-3 py-1 font-medium text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={queueStatus !== 'open'}
            onClick={callNext}
            type="button"
          >
            Call next
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-3">
          <input
            className="min-w-56 flex-1 rounded-md border border-slate-300 px-3 py-2"
            onChange={(event) => setWalkInName(event.target.value)}
            placeholder="Walk-in customer name"
            value={walkInName}
          />
          <button
            className="rounded-md bg-slate-900 px-3 py-2 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={queueStatus !== 'open' || !walkInName.trim()}
            onClick={addWalkIn}
            type="button"
          >
            Add walk-in
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-3 py-2">Position</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Joined</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeRows.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={6}>
                    No active queue entries.
                  </td>
                </tr>
              ) : (
                activeRows.map((row) => (
                  <tr className="border-t border-slate-200" key={row.id}>
                    <td className="px-3 py-2 font-medium text-slate-900">#{row.position}</td>
                    <td className="px-3 py-2">{row.displayName}</td>
                    <td className="px-3 py-2">{row.source === 'walk_in' ? 'Walk-in' : 'App'}</td>
                    <td className="px-3 py-2">{row.status}</td>
                    <td className="px-3 py-2">{new Date(row.joinedAt).toLocaleTimeString()}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded border border-emerald-300 px-2 py-1 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => markStatus(row.id, 'served')}
                          type="button"
                        >
                          Served
                        </button>
                        <button
                          className="rounded border border-amber-300 px-2 py-1 text-amber-700 hover:bg-amber-50"
                          onClick={() => markStatus(row.id, 'no_show')}
                          type="button"
                        >
                          No-show
                        </button>
                        <button
                          className="rounded border border-rose-300 px-2 py-1 text-rose-700 hover:bg-rose-50"
                          onClick={() => markStatus(row.id, 'cancelled')}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
