import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  MapPin,
  Smartphone
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, authError: authStatusError } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const res = await login(email, password, rememberMe);
    if (!res.success) setErrorMessage(res.error || 'Sign-in failed. Please try again.');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0c0a24] via-[#140f43] to-[#1e195b] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-[#fd2729] selection:text-white">
      
      {/* Top Brand Bar */}
      <header className="max-w-6xl mx-auto w-full flex flex-col items-stretch gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-xl shadow-md border border-white/20">
            <img 
              src="/star-electric-logo.png" 
              alt="Star Electric Enterprises" 
              className="h-8 sm:h-9 w-auto object-contain" 
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
              STAR ELECTRIC ENTERPRISES
            </h1>
            <p className="text-[11px] text-red-400 font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#fd2729]" /> Saddar, Rawalpindi • Supply Chain Division
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-2xl sm:rounded-full bg-slate-900/80 border border-blue-400/30 text-xs font-semibold text-slate-200 shadow-xs max-w-full self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Client: <strong className="text-white font-black">Jadeed Group of Companies</strong></span>
        </div>
      </header>

      {/* Main Login Center Card */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden">
          
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#fd2729]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Card Header with Original Logo */}
          <div className="space-y-2 text-center relative z-10">
            <div className="flex justify-center mb-2">
              <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-slate-200">
                <img 
                  src="/star-electric-logo.png" 
                  alt="Star Electric Enterprises" 
                  className="h-12 w-auto object-contain" 
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-400/40 text-blue-200 text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Secure Enterprise Supply Portal
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Sign In to Continue
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Enter your authorized credentials to access the Jadeed supply chain ledger &amp; deliveries.
            </p>
          </div>

          {/* Error Banner */}
          {(errorMessage || authStatusError) && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage || authStatusError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your authorized email"
                  autoCapitalize="none"
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm font-semibold focus:outline-none focus:border-[#fd2729] focus:ring-1 focus:ring-[#fd2729] transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm font-semibold focus:outline-none focus:border-[#fd2729] focus:ring-1 focus:ring-[#fd2729] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-[#fd2729] focus:ring-[#fd2729] cursor-pointer"
                />
                <span>Remember this device</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Firebase secure session</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#fd2729] hover:bg-[#e0191b] text-white font-black text-sm tracking-wide shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer disabled:opacity-70 mt-2 border border-red-400/30"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Quick Remote Access Hint */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign-in requires an authorized Firebase account</span>
            </p>
          </div>

        </div>
      </main>

      <footer className="max-w-4xl mx-auto w-full py-4">
        <p className="text-center text-xs text-slate-400">Accounts are issued by your portal administrator.</p>
        <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
          © {new Date().getFullYear()} Star Electric Enterprises (Saddar, Rawalpindi) • Jadeed Group Supply Chain Portal
        </p>
      </footer>

    </div>
  );
};
