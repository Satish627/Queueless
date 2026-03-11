import Link from 'next/link';

import { PageShell } from '@/components/page-shell';

export function DashboardHomePage() {
  return (
    <PageShell title="Dashboard" description="Live queue overview and quick actions for staff.">
      <div className="space-y-3 text-sm text-slate-700">
        <p>Queue status metrics and current entries will be rendered here.</p>
        <div className="flex gap-4">
          <Link className="font-medium text-brand-700 hover:text-brand-500" href="/dashboard/queue">
            Open queue management
          </Link>
          <Link className="font-medium text-brand-700 hover:text-brand-500" href="/dashboard/settings">
            Business settings
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
