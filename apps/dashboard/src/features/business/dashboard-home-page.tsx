'use client';

import Link from 'next/link';

import { PageShell } from '@/components/page-shell';
import { usePublicBusiness } from '@/hooks/use-public-business';

export function DashboardHomePage() {
  const { selectedBusiness, isLoading, error } = usePublicBusiness();

  const metrics = [
    { label: 'Queue status', value: selectedBusiness?.queue_status?.toUpperCase() ?? '-' },
    { label: 'Waiting', value: String(selectedBusiness?.waiting_count ?? 0) },
    { label: 'Queue name', value: selectedBusiness?.queue_name ?? '-' },
    {
      label: 'Avg service',
      value: selectedBusiness?.avg_service_minutes
        ? `${selectedBusiness.avg_service_minutes} min`
        : '-',
    },
  ];

  return (
    <PageShell title="Dashboard" description="Live queue overview and quick actions for staff.">
      <div className="space-y-6 text-sm text-slate-700">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          {isLoading ? (
            <p>Loading business data...</p>
          ) : selectedBusiness ? (
            <>
              <p className="font-semibold text-slate-900">{selectedBusiness.name}</p>
              <p>
                {selectedBusiness.category} · {selectedBusiness.city}
              </p>
            </>
          ) : (
            <p>No active business found in Supabase yet.</p>
          )}
          {error ? <p className="mt-2 text-rose-700">{error}</p> : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{metric.value}</p>
            </article>
          ))}
        </div>

        <div className="space-y-2">
          <p className="font-medium text-slate-900">Quick actions</p>
          <div className="flex flex-wrap gap-4">
            <Link
              className="font-medium text-brand-700 hover:text-brand-500"
              href="/dashboard/queue"
            >
              Open queue management
            </Link>
            <Link
              className="font-medium text-brand-700 hover:text-brand-500"
              href="/dashboard/settings"
            >
              Business settings
            </Link>
            <Link
              className="font-medium text-brand-700 hover:text-brand-500"
              href="/dashboard/staff"
            >
              Staff management
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
