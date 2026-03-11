'use client';

import {
  updateBusinessPreviewDetails,
  updateQueueSettings,
  type PublicBusinessSnapshot,
} from '@queueless/api';
import type { QueueStatus } from '@queueless/types';
import { useEffect, useState } from 'react';

import { PageShell } from '@/components/page-shell';
import { usePublicBusiness } from '@/hooks/use-public-business';
import { supabaseBrowserClient } from '@/lib/supabase-browser';

const initialFormFromBusiness = (business: PublicBusinessSnapshot | null) => {
  return {
    businessName: business?.name ?? '',
    category: business?.category ?? '',
    city: business?.city ?? '',
    address: business?.address ?? '',
    description: business?.description ?? '',
    avgServiceMinutes: business?.avg_service_minutes ?? 15,
    queueStatus: (business?.queue_status ?? 'closed') as QueueStatus,
  };
};

export function BusinessSettingsPage() {
  const {
    businesses,
    selectedBusiness,
    selectedBusinessId,
    setSelectedBusinessId,
    isLoading,
    error: businessError,
    refresh,
  } = usePublicBusiness();

  const [form, setForm] = useState(() => initialFormFromBusiness(null));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(initialFormFromBusiness(selectedBusiness));
  }, [selectedBusiness]);

  const handleSave = async () => {
    if (!selectedBusiness) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsSaving(true);

    try {
      await updateBusinessPreviewDetails(supabaseBrowserClient, {
        businessId: selectedBusiness.business_id,
        name: form.businessName,
        category: form.category,
        city: form.city,
        address: form.address,
        description: form.description || null,
      });

      if (selectedBusiness.queue_id) {
        await updateQueueSettings(supabaseBrowserClient, {
          queueId: selectedBusiness.queue_id,
          status: form.queueStatus,
          avgServiceMinutes: form.avgServiceMinutes,
        });
      }

      await refresh();
      setMessage('Business settings saved in Supabase.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageShell
      title="Business settings"
      description="Manage queue defaults and business profile information."
    >
      <div className="space-y-4 text-sm text-slate-700">
        <label className="grid gap-1">
          <span className="font-medium text-slate-900">Business</span>
          <select
            className="max-w-lg rounded-md border border-slate-300 px-3 py-2"
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

        {isLoading ? <p>Loading settings...</p> : null}
        {businessError ? <p className="text-rose-700">{businessError}</p> : null}
        {error ? <p className="text-rose-700">{error}</p> : null}
        {message ? <p className="text-emerald-700">{message}</p> : null}

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <label className="grid gap-1">
            <span className="font-medium text-slate-900">Business name</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              onChange={(event) =>
                setForm((previous) => ({ ...previous, businessName: event.target.value }))
              }
              value={form.businessName}
            />
          </label>

          <label className="grid gap-1">
            <span className="font-medium text-slate-900">Category</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              onChange={(event) =>
                setForm((previous) => ({ ...previous, category: event.target.value }))
              }
              value={form.category}
            />
          </label>

          <label className="grid gap-1">
            <span className="font-medium text-slate-900">City</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              onChange={(event) =>
                setForm((previous) => ({ ...previous, city: event.target.value }))
              }
              value={form.city}
            />
          </label>

          <label className="grid gap-1">
            <span className="font-medium text-slate-900">Address</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              onChange={(event) =>
                setForm((previous) => ({ ...previous, address: event.target.value }))
              }
              value={form.address}
            />
          </label>

          <label className="grid gap-1 md:col-span-2">
            <span className="font-medium text-slate-900">Description</span>
            <textarea
              className="rounded-md border border-slate-300 px-3 py-2"
              onChange={(event) =>
                setForm((previous) => ({ ...previous, description: event.target.value }))
              }
              rows={3}
              value={form.description}
            />
          </label>

          <label className="grid gap-1">
            <span className="font-medium text-slate-900">Average service minutes</span>
            <input
              className="rounded-md border border-slate-300 px-3 py-2"
              max={120}
              min={1}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  avgServiceMinutes: Number(event.target.value),
                }))
              }
              type="number"
              value={form.avgServiceMinutes}
            />
          </label>

          <label className="grid gap-1">
            <span className="font-medium text-slate-900">Queue status</span>
            <select
              className="rounded-md border border-slate-300 px-3 py-2"
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  queueStatus: event.target.value as QueueStatus,
                }))
              }
              value={form.queueStatus}
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </label>

          <div className="md:col-span-2">
            <button
              className="rounded-md bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-500 disabled:opacity-50"
              disabled={!selectedBusiness || isSaving}
              type="submit"
            >
              {isSaving ? 'Saving...' : 'Save settings'}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
