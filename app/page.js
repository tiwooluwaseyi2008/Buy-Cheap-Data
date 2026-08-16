"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

// Official SubAndGain verified plan IDs and markup prices
const PLANS = {
  MTN: [
    { id: '1', size: '1.0 GB (SME 30 Days)', price: 300 },
    { id: '2', size: '2.0 GB (SME 30 Days)', price: 600 },
    { id: '3', size: '3.0 GB (SME 30 Days)', price: 900 },
    { id: '137', size: '500MB (Corporate Gifting)', price: 200 }
  ],
  GLO: [
    { id: '55', size: '200MB (Corporate 14 Days)', price: 150 },
    { id: '56', size: '500MB (Corporate 30 Days)', price: 250 },
    { id: '57', size: '1.0 GB (Corporate 30 Days)', price: 350 },
    { id: '58', size: '2.0 GB (Corporate 30 Days)', price: 700 }
  ],
  AIRTEL: [
    { id: '65', size: '500MB (Gifting 7 Days)', price: 200 },
    { id: '66', size: '1.5GB (Gifting 7 Days)', price: 550 },
    { id: '68', size: '3.0GB (Gifting 30 Days)', price: 1200 },
    { id: '69', size: '4.0GB (Gifting 30 Days)', price: 1600 }
  ]
};

export default function Home() {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [balance, setBalance] = useState(0);

  const [network, setNetwork] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setLoading(true);
    const { data: user } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('email', cleanEmail)
      .single();
    
    if (user) {
      setBalance(Number(user.wallet_balance || 0));
    } else {
      await supabase.from('profiles').insert({ email: cleanEmail, wallet_balance: 0 });
      setBalance(0);
    }
    setIsLoggedIn(true);
    setLoading(false);
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 11) {
      setMessage({ type: 'error', text: 'Please enter a valid 11-digit phone number.' });
      return;
    }
    if (!selectedPlan) {
      setMessage({ type: 'error', text: 'Please choose a data bundle plan.' });
      return;
    }

    const planData = PLANS[network].find((p) => p.id === selectedPlan);
    if (!planData) {
      setMessage({ type: 'error', text: 'Invalid plan selected.' });
      return;
    }

    if (balance < planData.price) {
      setMessage({ type: 'error', text: 'Insufficient wallet balance. Please fund your account via Paystack.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/data-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          network,
          phone,
          planId: selectedPlan,
          amount: planData.price
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setBalance(data.newBalance);
        setPhone('');
        setSelectedPlan('');
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection failed. Please check your internet.' });
    }
    setLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <main className="max-w-md mx-auto px-4 mt-20">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Access Your Wallet</h2>
          <p className="text-slate-400 text-sm mb-6">Enter your email address to check your balance or buy data.</p>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              required
              placeholder="yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:border-sky-500 outline-none mb-4 font-mono text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3.5 rounded-xl transition"
            >
              {loading ? 'Opening...' : 'Open Wallet'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 mt-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 p-6 rounded-2xl border border-emerald-800/40">
          <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Available Balance</p>
          <h2 className="text-4xl font-black text-white">₦{balance.toLocaleString()}</h2>
          <p className="text-xs text-slate-400 mt-2 truncate">{email}</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-white mb-2">Automated Funding</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Send money to your Paystack virtual account or deposit via transfer to automatically credit this wallet.
          </p>
          <button
            onClick={() => alert('Paystack payment integration active via your configured webhook URL.')}
            className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold py-3 rounded-xl text-sm hover:bg-emerald-500/20 transition"
          >
            Fund via Paystack
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-6">Purchase Cheap Data</h2>
        
        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'} border`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handlePurchase} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">1. Select Network</label>
            <div className="grid grid-cols-3 gap-3">
              {['MTN', 'GLO', 'AIRTEL'].map((net) => (
                <button
                  key={net}
                  type="button"
                  onClick={() => { setNetwork(net); setSelectedPlan(''); }}
                  className={`py-3 rounded-xl font-black text-sm border-2 transition-all ${
                    network === net 
                      ? net === 'MTN' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' 
                        : net === 'GLO' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500 text-rose-400'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">2. Recipient Phone Number</label>
            <input
              type="tel"
              maxLength={11}
              required
              placeholder="080..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-3.5 text-white focus:border-sky-500 outline-none font-mono text-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">3. Select Bundle Plan</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLANS[network].map((plan) => (
                <label
                  key={plan.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                    selectedPlan === plan.id
                      ? 'bg-sky-500/10 border-sky-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={selectedPlan === plan.id}
                      onChange={() => setSelectedPlan(plan.id)}
                      className="w-4 h-4 accent-sky-500"
                    />
                    <span className="font-bold text-sm">{plan.size}</span>
                  </div>
                  <span className="font-black text-emerald-400 text-base">₦{plan.price}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-4 rounded-xl text-lg transition-all disabled:opacity-50 mt-4 shadow-lg shadow-sky-500/10"
          >
            {loading ? 'Processing Order...' : 'Buy Data Now'}
          </button>
        </form>
      </div>
    </main>
  );
}

