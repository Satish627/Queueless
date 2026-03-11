import Link from 'next/link';

import { PageShell } from '@/components/page-shell';

export function SignUpPage() {
  return (
    <PageShell
      title="Business sign up"
      description="Create your business account and start managing queues in real time."
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-700">
          Registration form scaffolding is ready for implementation.
        </p>
        <Link className="text-sm font-medium text-brand-700 hover:text-brand-500" href="/sign-in">
          Already have an account? Sign in
        </Link>
      </div>
    </PageShell>
  );
}
