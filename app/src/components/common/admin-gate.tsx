import { useState } from "react";
import { IconShield, IconLock } from "./icons";

const ADMIN_PASSCODE = "admin123"; // In real life this would be auth token verification

interface AdminGateProps {
  onAuthenticated: () => void;
}

function AdminGate({ onAuthenticated }: AdminGateProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PASSCODE) {
      onAuthenticated();
    } else {
      setError(true);
      setShaking(true);
      setPin("");
      setTimeout(() => setShaking(false), 500);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div
        className={`bg-white rounded-2xl border border-gray-200/60 shadow-float w-full max-w-sm p-8 ${shaking ? "animate-[shake_0.4s_ease]" : ""}`}
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
            <IconShield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-sm text-gray-500 mt-1">
            This area is restricted to platform administrators.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin passcode
            </label>
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Enter passcode"
                autoFocus
                className={`w-full px-4 py-3 pr-10 rounded-xl border text-gray-900 text-sm focus:outline-none focus:ring-2 transition-all ${error
                  ? "border-red-300 bg-red-50 focus:ring-red-500/30 focus:border-red-400"
                  : "border-gray-200 bg-surface-1 focus:ring-primary-500/30 focus:border-primary-400"
                  }`}
              />
              <IconLock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {error && (
              <p className="text-xs text-red-600 mt-1.5">
                Incorrect passcode. Access denied.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Enter Admin Board
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}

export default AdminGate;
