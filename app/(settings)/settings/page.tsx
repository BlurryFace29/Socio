'use client'

import { signOut } from 'next-auth/react';

export default function Settings() {
  return (
    <div className="prose p-2">
      <h2>Account</h2>
      <p>
        <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="btn btn-primary text-white">
          Log out
        </button>
      </p>
    </div>
  );
}
