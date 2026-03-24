import { useState } from "react";
import { useNavigate } from "react-router";
import { authService } from "../services/auth-service";
import { useAuthStore } from "../store/auth-store";
import { Button } from "../components/common/button";
import { IconShield, IconLock, IconCheck, IconX } from "../components/common/icons";

export default function SetupAccountPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await authService.completeSetup({ 
        password, 
        name, 
        accountType: (user?.accountType || "individual").toUpperCase() 
      });
      
      // Update store with new tokens and active user status
      useAuthStore.getState().loginWithResult(result);
      
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to complete setup");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 mb-6 shadow-md shadow-primary-500/20">
          <IconShield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Complete Profile</h1>
        <p className="text-base text-gray-500 font-medium mt-3 px-4">
          Almost there. Let's secure your account to access all escrow features.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-8 space-y-6">
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-100/50 rounded-xl flex items-center gap-3">
            <IconX className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 font-semibold">{error}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-medium transition-all"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Secure Password</label>
          <div className="relative">
            <IconLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              required
              min={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200/80 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-medium transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
          <div className="relative">
            <IconLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200/80 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-medium transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="pt-2">
           <Button
            type="submit"
            disabled={loading}
            className="w-full py-5 text-base shadow-md justify-center"
            icon={loading ? undefined : <IconCheck className="w-5 h-5" />}
          >
            {loading ? "Activating Profile..." : "Activate Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
