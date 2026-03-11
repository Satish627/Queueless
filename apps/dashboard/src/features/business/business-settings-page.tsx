'use client';

import { useState } from 'react';

import { PageShell } from '@/components/page-shell';

export function BusinessSettingsPage() {
  const [businessName, setBusinessName] = useState('Nordic Cut Barbershop');
  const [category, setCategory] = useState('Barbershop');
  const [city, setCity] = useState('Copenhagen');
  const [avgServiceMinutes, setAvgServiceMinutes] = useState(15);
  const [queueStatus, setQueueStatus] = useState<'open' | 'closed'>('open');
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = () => {
    setMessage('Business settings saved in preview mode.');
  };

  return (
    <PageShell
      title="Business settings"
      description="Manage queue defaults and business profile information."
    >
      <form
        className="grid gap-4 text-sm text-slate-700 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          handleSave();
        }}
      >
        <label className="grid gap-1">
          <span className="font-medium text-slate-900">Business name</span>
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            onChange={(event) => setBusinessName(event.target.value)}
            value={businessName}
          />
        </label>

        <label className="grid gap-1">
          <span className="font-medium text-slate-900">Category</span>
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          />
        </label>

        <label className="grid gap-1">
          <span className="font-medium text-slate-900">City</span>
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            onChange={(event) => setCity(event.target.value)}
            value={city}
          />
        </label>

        <label className="grid gap-1">
          <span className="font-medium text-slate-900">Average service minutes</span>
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            max={120}
            min={1}
            onChange={(event) => setAvgServiceMinutes(Number(event.target.value))}
            type="number"
            value={avgServiceMinutes}
          />
        </label>

        <label className="grid gap-1 md:col-span-2">
          <span className="font-medium text-slate-900">Queue status</span>
          <select
            className="max-w-60 rounded-md border border-slate-300 px-3 py-2"
            onChange={(event) => setQueueStatus(event.target.value as 'open' | 'closed')}
            value={queueStatus}
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </label>

        <div className="md:col-span-2">
          <button
            className="rounded-md bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-500"
            type="submit"
          >
            Save settings
          </button>
          {message ? <p className="mt-2 text-slate-600">{message}</p> : null}
        </div>
      </form>
    </PageShell>
  );
}
