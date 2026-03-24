import { Button } from "./button";
import { useState } from "react";

interface DeleteEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  loading: boolean;
}

export function DeleteEscrowModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: DeleteEscrowModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Password is required");
      return;
    }
    setError(null);
    try {
      await onConfirm(password);
      setPassword(""); // Clear for next time
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deletion failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Escrow?</h3>
          <p className="text-sm text-gray-600 mb-6">
            This action cannot be undone. All transaction history will be permanently removed.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm your password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                required
              />
            </div>

            {error && (
              <p className="p-3 bg-red-50 text-xs font-medium text-red-600 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setPassword("");
                  setError(null);
                  onClose();
                }}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 !bg-red-600 hover:!bg-red-700 text-white"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
