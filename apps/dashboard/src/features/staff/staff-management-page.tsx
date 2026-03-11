'use client';

import { useState } from 'react';

import { PageShell } from '@/components/page-shell';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'staff' | 'owner';
}

export function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: 'staff-1', name: 'Emma Stone', email: 'emma@queueless.app', role: 'staff' },
    { id: 'staff-2', name: 'Liam Scott', email: 'liam@queueless.app', role: 'staff' },
  ]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const addStaff = () => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    if (!normalizedName || !normalizedEmail) {
      return;
    }

    setStaff((previous) => [
      ...previous,
      {
        id: `staff-${Date.now()}`,
        name: normalizedName,
        email: normalizedEmail,
        role: 'staff',
      },
    ]);
    setName('');
    setEmail('');
  };

  return (
    <PageShell title="Staff" description="Manage staff members who can operate your active queue.">
      <div className="space-y-4 text-sm text-slate-700">
        <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 p-3">
          <input
            className="min-w-48 flex-1 rounded-md border border-slate-300 px-3 py-2"
            onChange={(event) => setName(event.target.value)}
            placeholder="Staff name"
            value={name}
          />
          <input
            className="min-w-56 flex-1 rounded-md border border-slate-300 px-3 py-2"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Staff email"
            value={email}
          />
          <button
            className="rounded-md bg-slate-900 px-3 py-2 font-medium text-white hover:bg-slate-700"
            onClick={addStaff}
            type="button"
          >
            Add staff
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr className="border-t border-slate-200" key={member.id}>
                  <td className="px-3 py-2">{member.name}</td>
                  <td className="px-3 py-2">{member.email}</td>
                  <td className="px-3 py-2">{member.role}</td>
                  <td className="px-3 py-2">
                    <button
                      className="rounded border border-rose-300 px-2 py-1 text-rose-700 hover:bg-rose-50"
                      onClick={() =>
                        setStaff((previous) => previous.filter((item) => item.id !== member.id))
                      }
                      type="button"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
