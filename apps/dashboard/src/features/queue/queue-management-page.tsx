import { PageShell } from '@/components/page-shell';

export function QueueManagementPage() {
  return (
    <PageShell
      title="Queue management"
      description="Monitor waiting customers and process queue actions."
    >
      <div className="space-y-2 text-sm text-slate-700">
        <p>Live queue table scaffolding ready for realtime subscriptions.</p>
        <p>
          Actions to add walk-ins, call next, mark served, and cancel entries will plug in here.
        </p>
      </div>
    </PageShell>
  );
}
