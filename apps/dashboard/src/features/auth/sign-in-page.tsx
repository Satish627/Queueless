import Link from 'next/link';

import { PageShell } from '@/components/page-shell';

export function SignInPage() {
  return (
    <PageShell
      title="Business sign in"
      description="Access your queue dashboard, call next customers, and manage live flow."
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-700">
          Auth form scaffolding is ready for Supabase integration.
        </p>
        <Link className="text-sm font-medium text-brand-700 hover:text-brand-500" href="/sign-up">
          Need an account? Create business profile
        </Link>
      </div>
    </PageShell>
  );
}
