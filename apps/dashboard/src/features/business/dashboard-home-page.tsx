import Link from 'next/link';

import { PageShell } from '@/components/page-shell';

export function DashboardHomePage() {
  const metrics = [
    { label: 'Queue status', value: 'Open' },
    { label: 'Waiting', value: '6' },
    { label: 'Called', value: '1' },
    { label: 'Avg service', value: '15 min' },
  ];

  return (
    <PageShell title="Dashboard" description="Live queue overview and quick actions for staff.">
      <div className="space-y-6 text-sm text-slate-700">
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

        <div className="rounded-lg border border-slate-200 p-4">
          <p className="font-medium text-slate-900">MVP focus</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Operate one active queue in real time.</li>
            <li>Add walk-ins and process customers quickly.</li>
            <li>Keep queue settings simple and easy to control.</li>
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
