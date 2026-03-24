import { Link } from "react-router";
import { useAuthStore } from "../../store/auth-store";
import { IconShield } from "./icons";

export function KycPrompt() {
  const { user } = useAuthStore();

  if (!user || user.identityVerified) return null;

  return (
    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <IconShield className="w-5 h-5 text-amber-600" />
         </div>
         <div>
            <h3 className="text-sm font-semibold text-amber-900">Verification Required</h3>
            <p className="text-xs text-amber-700">Set up your identity and bank details to receive payouts.</p>
         </div>
      </div>
      <Link 
        to="/kyc" 
        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
      >
        Complete Setup
      </Link>
    </div>
  );
}
