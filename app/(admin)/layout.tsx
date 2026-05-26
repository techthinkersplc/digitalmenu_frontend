"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "../lib/axios"; // 🚀 Ensure this points to your configured axios instance

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 Minutes

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  // UI States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  
  // Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Auth Guard
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(false);
      if (pathname !== "/admin") {
        router.replace("/admin"); // Using replace stops back-button history loops
      }
    } else {
      setIsAuthenticated(true);
      if (pathname === "/admin") {
        router.replace("/admin/dashboard");
      }
    }
  }, [pathname, router]); 

  // 2. Logout Logic
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin");
  };

  // 3. Inactivity Handling
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => handleLogout(), INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    if (isAuthenticated && pathname !== "/admin") {
      const events = ["mousemove", "mousedown", "keypress", "scroll", "touchstart"];
      events.forEach(e => window.addEventListener(e, resetTimer));
      resetTimer();
      return () => events.forEach(e => window.removeEventListener(e, resetTimer));
    }
  }, [isAuthenticated, pathname]);

  // 4. Click Outside Dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 5. 🚀 Submit Password Change
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (newPassword !== confirmPassword) {
      setFormError("New passwords do not match!");
      return;
    }
    
    setLoading(true);
    try {
      // Cleanest path following our backend route adjustment
      const response = await api.post('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      
      alert(response.data.message || "Password updated successfully!");
      setIsPasswordModalOpen(false);
      
      // Reset inputs
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      // 🛠 ROBUST ERROR CAPTURE: Prints exact backend error to the UI
      console.error("Backend Error Details:", error.response);
      
      // ✅ FIXED: Inserted logical OR (||) fallback operators to prevent type crashes
      const errMsg = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        (typeof error.response?.data === 'string' ? error.response.data : null) || 
        "Failed to connect to server.";
      
      setFormError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated === null) return null;
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      {isAuthenticated && pathname !== "/admin" && (
        <header className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-4 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-emerald-400">Admin Panel</h1>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-full transition"
              >
                <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950 font-bold text-xs">A</div>
                <span className="text-sm font-medium text-zinc-300 hidden sm:inline">profile</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={() => { setIsDropdownOpen(false); setIsPasswordModalOpen(true); }}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition"
                  >
                    Change Password
                  </button>
                  <div className="border-t border-zinc-800 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      <main>{children}</main>

      {/* PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold">Update Password</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-xs text-red-400 font-medium">
                  ⚠️ {formError}
                </div>
              )}

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-500 text-zinc-950 px-4 py-2 text-xs font-semibold rounded-lg hover:bg-emerald-400 transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}