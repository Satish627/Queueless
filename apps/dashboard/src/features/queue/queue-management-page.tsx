'use client';

import {
  addWalkInEntry,
  callNextEntryForQueue,
  listQueueEntriesForQueue,
  setQueueEntryStatus,
  updateQueueSettings,
  type DashboardQueueEntrySnapshot,
} from '@queueless/api';
import type { QueueEntryStatus, QueueStatus } from '@queueless/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PageShell } from '@/components/page-shell';
import { usePublicBusiness } from '@/hooks/use-public-business';
import { supabaseBrowserClient } from '@/lib/supabase-browser';

export function QueueManagementPage() {
  const {
    businesses,
    selectedBusiness,
    selectedBusinessId,
    setSelectedBusinessId,
    isLoading,
    error: businessError,
    refresh,
  } = usePublicBusiness();

  const [rows, setRows] = useState<DashboardQueueEntrySnapshot[]>([]);
  const [walkInName, setWalkInName] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queueId = selectedBusiness?.queue_id ?? null;

  const loadRows = useCallback(async () => {
    if (!queueId) {
      setRows([]);
      return;
    }

    try {
      const entries = await listQueueEntriesForQueue(supabaseBrowserClient, queueId);
      setRows(entries);
    } catch (loadError) {
      if (loadError instanceof Error) {
        setError(loadError.message);
      } else {
        setError('Unable to load queue entries.');
      }
    }
  }, [queueId]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const callNext = async () => {
    if (!queueId) {
      return;
    }

    setError(null);
    setIsBusy(true);
    try {
      await callNextEntryForQueue(supabaseBrowserClient, queueId);
      await loadRows();
      await refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : 'Unable to call next customer.',
      );
    } finally {
      setIsBusy(false);
    }
  };

  const addWalkIn = async () => {
    if (!queueId || !walkInName.trim()) {
      return;
    }

    setError(null);
    setIsBusy(true);
    try {
      await addWalkInEntry(supabaseBrowserClient, {
        queueId,
        displayName: walkInName.trim(),
      });
      setWalkInName('');
      await loadRows();
      await refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : 'Unable to add walk-in customer.',
      );
    } finally {
      setIsBusy(false);
    }
  };

  const markStatus = async (
    entryId: string,
    status: Extract<QueueEntryStatus, 'served' | 'cancelled' | 'no_show'>,
  ) => {
    setError(null);
    setIsBusy(true);
    try {
      await setQueueEntryStatus(supabaseBrowserClient, {
        entryId,
        status,
      });
      await loadRows();
      await refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : 'Unable to update entry status.',
      );
    } finally {
      setIsBusy(false);
    }
  };

  const toggleQueueStatus = async () => {
    if (!selectedBusiness?.queue_id || !selectedBusiness.queue_status) {
      return;
    }

    const nextStatus: QueueStatus = selectedBusiness.queue_status === 'open' ? 'closed' : 'open';

    setError(null);
    setIsBusy(true);
    try {
      await updateQueueSettings(supabaseBrowserClient, {
        queueId: selectedBusiness.queue_id,
        status: nextStatus,
        avgServiceMinutes: selectedBusiness.avg_service_minutes ?? 15,
      });
      await refresh();
      await loadRows();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : 'Unable to update queue settings.',
      );
    } finally {
      setIsBusy(false);
    }
  };

  const waitingCount = useMemo(() => rows.filter((row) => row.status === 'waiting').length, [rows]);
  const calledCount = useMemo(() => rows.filter((row) => row.status === 'called').length, [rows]);

  return (
    <PageShell
      title="Queue management"
      description="Monitor waiting customers and process queue actions."
    >
      <div className="space-y-5 text-sm text-slate-700">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="font-medium text-slate-900">Business</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2"
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              value={selectedBusinessId}
            >
              {businesses.map((business) => (
                <option key={business.business_id} value={business.business_id}>
                  {business.name}
                </option>
              ))}
            </select>
          </label>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            {isLoading ? (
              <p>Loading business...</p>
            ) : (
              <>
                <p className="font-semibold text-slate-900">
                  {selectedBusiness?.name ?? 'No business selected'}
                </p>
                <p>{selectedBusiness?.queue_name ?? 'No queue configured'}</p>
              </>
            )}
          </div>
        </div>

        {businessError ? <p className="text-rose-700">{businessError}</p> : null}
        {error ? <p className="text-rose-700">{error}</p> : null}

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            Status: {selectedBusiness?.queue_status ?? '-'}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Waiting: {waitingCount}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Called: {calledCount}</span>
          <button
            className="rounded-md border border-slate-300 px-3 py-1 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            disabled={!selectedBusiness?.queue_id || isBusy}
            onClick={() => void toggleQueueStatus()}
            type="button"
          >
            {selectedBusiness?.queue_status === 'open' ? 'Close queue' : 'Open queue'}
          </button>
          <button
            className="rounded-md bg-brand-700 px-3 py-1 font-medium text-white hover:bg-brand-500 disabled:opacity-50"
            disabled={
              !selectedBusiness?.queue_id || selectedBusiness.queue_status !== 'open' || isBusy
            }
            onClick={() => void callNext()}
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
            className="rounded-md bg-slate-900 px-3 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            disabled={
              !selectedBusiness?.queue_id ||
              selectedBusiness.queue_status !== 'open' ||
              !walkInName.trim() ||
              isBusy
            }
            onClick={() => void addWalkIn()}
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
              {rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={6}>
                    No active queue entries.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr className="border-t border-slate-200" key={row.entry_id}>
                    <td className="px-3 py-2 font-medium text-slate-900">#{row.position}</td>
                    <td className="px-3 py-2">{row.display_name}</td>
                    <td className="px-3 py-2">{row.source === 'walk_in' ? 'Walk-in' : 'App'}</td>
                    <td className="px-3 py-2">{row.status}</td>
                    <td className="px-3 py-2">{new Date(row.joined_at).toLocaleTimeString()}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded border border-emerald-300 px-2 py-1 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                          disabled={isBusy}
                          onClick={() => void markStatus(row.entry_id, 'served')}
                          type="button"
                        >
                          Served
                        </button>
                        <button
                          className="rounded border border-amber-300 px-2 py-1 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                          disabled={isBusy}
                          onClick={() => void markStatus(row.entry_id, 'no_show')}
                          type="button"
                        >
                          No-show
                        </button>
                        <button
                          className="rounded border border-rose-300 px-2 py-1 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          disabled={isBusy}
                          onClick={() => void markStatus(row.entry_id, 'cancelled')}
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
