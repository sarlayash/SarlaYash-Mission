import React from 'react';
import { AlertCircle, Database, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { storage } from '../../lib/storage';

interface DemoModeBannerProps {
  isDemo: boolean;
  onRefresh: () => void;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({ isDemo, onRefresh }) => {
  const [copied, setCopied] = React.useState(false);

  const handleSeed = () => {
    storage.seedDemoData();
    onRefresh();
  };

  const handleClear = () => {
    if (window.confirm('Reset all records to 0 (Pristine Production State)?')) {
      storage.clearToEmptyProduction();
      onRefresh();
    }
  };

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300 py-1.5 px-4 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
            isDemo ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
          }`}>
            <Database className="w-3 h-3" />
            {isDemo ? 'DEVELOPMENT MODE' : 'LIVE PRODUCTION SCHEMA'}
          </span>
          <span className="text-slate-400 hidden sm:inline">
            {isDemo 
              ? 'Demo records are strictly labeled. No invented statistics.' 
              : 'Strict Real Data Active: Metrics show actual database entries only.'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isDemo ? (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors py-0.5 px-2 rounded hover:bg-slate-800"
              title="Wipe demo records to show 0 metrics"
            >
              <Trash2 className="w-3 h-3" />
              Reset to 0 Records
            </button>
          ) : (
            <button
              onClick={handleSeed}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors py-0.5 px-2 rounded bg-cyan-950/60 border border-cyan-800/40"
              title="Populate labeled test fixtures"
            >
              <RefreshCw className="w-3 h-3" />
              Load Sample Test Fixtures
            </button>
          )}

          <div className="text-slate-500 hidden md:inline">|</div>
          <div className="text-slate-400 hidden lg:flex items-center gap-1">
            <span>UPI: <span className="font-mono text-slate-200">9873152277@kotak</span></span>
            <span className="text-slate-500">(₹1 / session)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
