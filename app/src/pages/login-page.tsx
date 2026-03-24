import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router";
import { useAuthStore } from "../store/auth-store";
import { IconEye, IconEyeOff, IconShield } from "../components/common/icons";
import { FcGoogle } from "react-icons/fc";
import { FaMeta } from "react-icons/fa6";
import { Button } from "../components/common/button";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, error, clearError, isLoading } = useAuthStore();

  const location = useLocation();
  const from = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch {
      // error is handled in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-[1000px] bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* Left — Form */}
        <div className="w-full md:w-1/2 p-10 lg:p-14 flex flex-col justify-center relative z-10">
          
          <div className="mb-10 text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
                <IconShield className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Escrow</span>
            </Link>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Welcome back
            </h1>
            <p className="text-base text-gray-500 mt-2 font-medium">
              Enter your credentials to access your secure workspace.
            </p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100/50 text-red-600 text-sm font-medium mb-6 flex items-center animate-fade-in shadow-sm">
              <span className="mr-2">⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link to="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200/80 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-md transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full justify-center py-6 text-base shadow-md" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Sign into account"}
              </Button>
            </div>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Or continue with</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer">
              <FcGoogle className="w-5 h-5" />
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer">
              <FaMeta className="w-5 h-5 text-[#0082FB]" />
              Meta
            </button>
          </div>

          <p className="text-center text-sm font-medium text-gray-500 mt-10">
            New to Escrow?{" "}
            <Link to="/register" state={location.state} className="text-primary-600 font-bold hover:text-primary-700">
              Create an account
            </Link>
          </p>
        </div>

        {/* Right — Image */}
        <div className="hidden md:flex w-1/2 bg-gray-900 relative p-12 items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 to-gray-900/80 pointer-events-none" />
          <img
            src="/authn-image.webp"
            alt="Secure escrow illustration"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
          />
          <div className="relative z-10 text-white max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mb-6">
               <IconShield className="w-8 h-8 text-primary-400" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              Secure transactions, guaranteed.
            </h2>
            <p className="text-lg text-gray-300 font-medium leading-relaxed">
              We hold funds securely until both parties are satisfied. No risk, zero friction.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
