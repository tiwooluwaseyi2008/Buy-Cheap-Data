import './globals.css';

export const metadata = {
  title: 'Buy Cheap Data | MTN, GLO, AIRTEL',
  description: 'Buy cheap and instant data bundles for MTN, Glo, and Airtel in Nigeria. Automated wallet funding via Paystack.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 font-sans selection:bg-sky-500/30">
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-yellow-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
                Buy Cheap Data
              </h1>
              <p className="text-xs font-medium text-slate-500">wheymydata.vercel.app</p>
            </div>
            <a
              href="/admin"
              className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl border border-slate-700/50 transition-all"
            >
              Admin Login
            </a>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

