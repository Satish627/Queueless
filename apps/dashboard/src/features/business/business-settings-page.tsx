import { PageShell } from '@/components/page-shell';

export function BusinessSettingsPage() {
  return (
    <PageShell title="Business settings" description="Manage queue defaults and business profile information.">
      <p className="text-sm text-slate-700">
        Settings form scaffolding is ready for queue open/closed state and average service time controls.
      </p>
    </PageShell>
  );
}
