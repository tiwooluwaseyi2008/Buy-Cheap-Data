"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [users, setUsers] = useState([]);
  const [txs, setTxs] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (password === 'wheymydata2024') {
      setIsAuth(true);
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: transactions } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(20);
      if (profiles) setUsers(profiles);
      if (transactions) setTxs(transactions);
    } else {
      alert('Wrong Admin Password');
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm w-full">
          <h1 className="text-xl font-bold text-sky-400 mb-4">Admin Security</h1>
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 mb-4 text-white outline-none focus:border-sky-500 text-sm"
          />
          <button className="w-full bg-sky-500 text-slate-950 font-bold py-3 rounded-xl text-sm transition">Unlock Dashboard</button>
        </form>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 mt-8 pb-12">
      <h1 className="text-2xl font-black text-sky-400 mb-8">System Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">User Wallets</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Balance (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="py-3 text-slate-300 text-xs truncate max-w-[200px]">{u.email}</td>
                    <td className="py-3 font-bold text-emerald-400">₦{Number(u.wallet_balance || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Details</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {txs.map(t => (
                  <tr key={t.id}>
                    <td className="py-3 text-slate-300 uppercase text-xs font-bold">{t.type}</td>
                    <td className="py-3 text-slate-400 text-xs">{t.details}</td>
                    <td className={`py-3 font-bold text-xs ${t.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

