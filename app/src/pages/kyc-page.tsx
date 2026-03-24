import { useState } from "react";
import { useAuthStore } from "../store/auth-store";
import { identityService } from "../services/identity-service";
import { Button } from "../components/common/button";
import { IconShield, IconCheck } from "../components/common/icons";

const BANKS = [
  { code: "058", name: "GTBank" },
  { code: "033", name: "UBA" },
];

export default function KycPage() {
  const { user, initialize } = useAuthStore();
  const [kycType, setKycType] = useState<"BVN" | "NIN">("BVN");
  const [kycId, setKycId] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user?.identityVerified) {
    return (
      <div className="max-w-xl mx-auto py-12 animate-fade-in">
         <div className="bg-emerald-50/50 rounded-3xl p-10 text-center border border-emerald-100">
           <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mb-6 shadow-sm shadow-emerald-500/10">
             <IconShield className="w-10 h-10 text-emerald-600" />
           </div>
           <h2 className="text-2xl font-bold text-emerald-950 mb-3 tracking-tight">Identity Verified</h2>
           <p className="text-base text-emerald-700/90 font-medium">Your identity and bank details have been successfully verified. You are completely ready to receive secure payouts.</p>
         </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (kycId.length !== 11) {
      setError(`${kycType} must be exactly 11 digits.`);
      return;
    }
    if (bankAccountNumber.length !== 10) {
      setError("Account number must be exactly 10 digits.");
      return;
    }
    if (!bankCode) {
      setError("Please select a bank.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await identityService.verifyIdentity({ 
        kycType, 
        kycId,
        bankAccountNumber,
        bankCode
      });
      if (response.verified) {
        initialize();
      } else {
        setError(response.message || "Verification failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Identity & Verification</h1>
        <p className="text-base text-gray-500 font-medium">
          Verify your identity and provide your bank details to ensure secure escrow payouts. Escrow uses bank-grade security to guard your details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 shadow-xl shadow-gray-200/40 rounded-[2rem] p-8 md:p-10 space-y-8">
         {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-medium text-sm flex items-center gap-3">
               <span className="text-lg">⚠</span> {error}
            </div>
         )}

         {/* Identity Section */}
         <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">1. Personal Identity</h3>
            <div className="space-y-6">
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Identity Type</label>
                    <div className="relative">
                        <select
                            value={kycType}
                            onChange={(e) => {
                            setKycType(e.target.value as "BVN" | "NIN");
                            setKycId("");
                            setError(null);
                            }}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/80 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-medium transition-all appearance-none"
                            disabled={loading}
                        >
                            <option value="BVN">Bank Verification Number (BVN)</option>
                            <option value="NIN">National Identity Number (NIN)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">{kycType} Number</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={11}
                        value={kycId}
                        onChange={(e) => setKycId(e.target.value.replace(/\D/g, ""))}
                        placeholder={`Enter 11-digit ${kycType}`}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/80 text-gray-900 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium"
                        disabled={loading}
                    />
                </div>
            </div>
         </div>

         {/* Bank Section */}
         <div>
             <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">2. Payout Account</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Account Number</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit number"
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/80 text-gray-900 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium"
                        disabled={loading}
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Select Bank</label>
                    <div className="relative">
                        <select
                            value={bankCode}
                            onChange={(e) => setBankCode(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/80 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium appearance-none"
                            disabled={loading}
                        >
                            <option value="">Select a Bank</option>
                            {BANKS.map(bank => (
                            <option key={bank.code} value={bank.code}>{bank.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                 </div>
             </div>
         </div>

         <div className="pt-4 border-t border-gray-100">
             <Button
                type="submit"
                disabled={loading || kycId.length !== 11 || bankAccountNumber.length !== 10 || !bankCode}
                className="w-full py-4 text-base shadow-md justify-center"
                icon={loading ? undefined : <IconCheck className="w-5 h-5" />}
              >
                {loading ? "Verifying Data securely..." : "Verify Identity & Bank"}
              </Button>
              <p className="text-xs text-center text-gray-400 mt-4 font-medium flex items-center justify-center gap-1.5">
                 <IconShield className="w-3.5 h-3.5" /> Secure end-to-end encryption 
              </p>
         </div>
      </form>
    </div>
  );
}

