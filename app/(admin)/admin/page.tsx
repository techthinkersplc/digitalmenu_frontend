"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../services/auth.service"; 

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. CALL THE REAL BACKEND SERVICE
      // This passes the credentials and triggers token storage
      await authService.login({ email, password });

      // 2. REDIRECT ON SUCCESS
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      // 3. CORRECTED ERROR HANDLING
      // Adjusted to read your backend middleware's exact response shape: { error: "..." }
      let errorMessage = "Invalid credentials. Please try again.";
      
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-950 text-white font-sans">
      <div className="w-full max-w-md rounded-[2rem] border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-8 shadow-2xl">
        <div className="mb-8 text-center">
          {/* 🍽 Updated Branding matching Caramel Kitchen */}
          <h2 className="text-3xl font-black tracking-tight uppercase italic">
            Caramel <span className="text-emerald-500">Kitchen</span>
          </h2>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
            Admin Dashboard Portal
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-600/10 p-4 text-sm text-red-400 border border-red-500/20 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3.5 text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-all"
              placeholder="admin@caramelkitchen.com"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 pl-5 pr-12 py-3.5 text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase font-black tracking-wider text-zinc-500 "
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 rounded-2xl bg-emerald-600 py-4 font-bold text-xs uppercase tracking-widest text-white hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-900/20"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying Credentials...
              </span>
            ) : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}