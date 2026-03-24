import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/auth-store";
import { Button } from "../components/common/button";
import {
  IconUser,
  IconMail,
  IconLogout,
  IconShield,
  IconBuilding,
  IconCheck,
  IconX,
} from "../components/common/icons";
import { api } from "../services/api-client";
import type { UserResponse } from "../types/index";

const BANKS = [
  { code: "058", name: "GTBank" },
  { code: "033", name: "UBA" },
];

export default function AccountPage() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ accountNumber: "", bankCode: "", bankName: "" });
  const [bankSaving, setBankSaving] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  const handleSaveBank = async () => {
    if (bankForm.accountNumber.length !== 10) {
      setBankError("Account number must be exactly 10 digits.");
      return;
    }
    if (!bankForm.bankCode.trim()) {
      setBankError("Please select a bank.");
      return;
    }
    setBankSaving(true);
    setBankError(null);
    try {
      const updated = await api<UserResponse>("/auth/bank-account", {
        method: "PUT",
        body: JSON.stringify(bankForm),
      });
      setUser(updated);
      setEditingBank(false);
      setBankForm({ accountNumber: "", bankCode: "", bankName: "" });
    } catch (e) {
      setBankError(e instanceof Error ? e.message : "Failed to save bank account.");
    } finally {
      setBankSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in relative z-10 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-base font-medium text-gray-500 mt-2">Manage your personal profile, linked payment methods, and security preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/30 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/30">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-3xl font-bold text-primary-700 shadow-inner">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{user.name}</h2>
              <p className="text-base font-medium text-gray-500 mb-2">{user.email}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[0.5rem] text-xs font-bold uppercase tracking-wider ${user.accountType === "company" ? "bg-blue-50 text-blue-700" : "bg-primary-50 text-primary-700"}`}>
                  {user.accountType === "company" ? <IconBuilding className="w-3.5 h-3.5" /> : <IconUser className="w-3.5 h-3.5" />}
                  {user.accountType === "company" ? "Company" : "Individual"}
                </span>
                {user.userTier === "AGENT" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[0.5rem] text-xs font-bold uppercase tracking-wider bg-violet-100 text-violet-700 border border-violet-200 shadow-sm">
                    🏛️ Agent Partner
                  </span>
                )}
                {user.identityVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[0.5rem] text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700">
                    <IconCheck className="w-3.5 h-3.5" /> KYC Verified
                  </span>
                ) : (
                  <button
                    onClick={() => navigate("/kyc")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[0.5rem] text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer shadow-sm"
                  >
                    ⚠ Setup Identity
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="divide-y divide-gray-100 p-2">
          <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 rounded-xl transition-colors m-1">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                <IconUser className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-0.5">Full Name</p>
                <p className="text-sm font-bold text-gray-900">{user.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 rounded-xl transition-colors m-1">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                <IconMail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-0.5">Email Address</p>
                <p className="text-sm font-bold text-gray-900">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 rounded-xl transition-colors m-1">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                <IconShield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-0.5">Account ID</p>
                <p className="text-sm font-mono font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md inline-flex">{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account (real — saved as payment method) */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/30 overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gray-50/30">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">Linked Bank Account</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">Sellers require a linked bank account to receive payouts securely.</p>
          </div>
          <button
            onClick={() => { setEditingBank(!editingBank); setBankError(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${editingBank ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200' : 'bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-100'} cursor-pointer`}
          >
            {editingBank ? "Cancel" : (user.hasBankAccount ? "Replace Account" : "Add Account")}
          </button>
        </div>

        {user.hasBankAccount && !editingBank ? (
          <div className="p-8">
            {/* Card-style display */}
            <div className="bg-gray-900 rounded-[1.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-gray-900/20 max-w-sm">
              {/* Decorative shapes */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-gradient-to-br from-white/10 to-transparent -translate-y-1/3 translate-x-1/3 blur-2xl flex-shrink-0" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-gradient-to-tr from-primary-500/20 to-transparent translate-y-1/2 -translate-x-1/4 blur-xl" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-8 rounded-md bg-gradient-to-r from-gray-200 to-gray-400 opacity-90 relative overflow-hidden">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-gray-500/30"></div>
                  </div>
                  <p className="text-xs font-bold text-white/50 tracking-[0.2em] uppercase">Escrow Pay</p>
                </div>
                <p className="text-2xl font-mono font-medium tracking-[0.15em] mb-4 text-gray-100 drop-shadow-sm">
                  {user.bankAccountNumberMasked ?? "•••• •••• ••••"}
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Bank Name</p>
                    <p className="text-sm font-semibold text-white/90">{user.bankName || user.bankCode || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-sm font-medium text-gray-500 mt-6 flex items-center gap-2">
              <IconShield className="w-4 h-4 text-emerald-500" /> All transfers bound to this account are strongly encrypted.
            </p>
          </div>
        ) : editingBank ? (
          <div className="p-8 bg-gray-50/30">
            {bankError && (
              <div className="flex items-center gap-3 text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-4 mb-6">
                <IconX className="w-5 h-5 shrink-0 text-red-500" /> {bankError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Select Bank</label>
                <div className="relative">
                  <select
                    value={bankForm.bankCode}
                    onChange={(e) => {
                      const bank = BANKS.find(b => b.code === e.target.value);
                      setBankForm(f => ({ ...f, bankCode: e.target.value, bankName: bank?.name || "" }));
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-gray-50/50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all appearance-none"
                  >
                    <option value="">Select a Nigerian Bank</option>
                    {BANKS.map(b => (
                      <option key={b.code} value={b.code}>{b.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">10-Digit Account Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="e.g 0123456789"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm((f) => ({ ...f, accountNumber: e.target.value.replace(/\D/g, "") }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200/80 bg-gray-50/50 text-gray-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all cursor-text"
                />
              </div>
            </div>

            <Button
              className="py-4 px-8 text-base shadow-md"
              icon={<IconCheck className="w-5 h-5" />}
              onClick={handleSaveBank}
              disabled={bankSaving || bankForm.accountNumber.length !== 10 || !bankForm.bankCode}
            >
              {bankSaving ? "Saving details encryptedly…" : "Securely Save Account Details"}
            </Button>
          </div>

        ) : (
          <div className="p-10 text-center flex flex-col items-center justify-center bg-gray-50 border-t border-gray-100">
             <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                <IconBuilding className="w-8 h-8 text-gray-400" />
             </div>
             <h4 className="text-lg font-bold text-gray-900 mb-2">No active bank account</h4>
             <p className="text-sm font-medium text-gray-500 max-w-sm mb-6">
                You currently do not have a linked bank account. Sellers must have a verified bank account to accept funds when an escrow is completed.
             </p>
             <Button onClick={() => { setEditingBank(true); setBankError(null); }} className="shadow-md">
                Link Secure Bank Account
             </Button>
          </div>
        )}
      </div>

      {/* Security */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/30 p-8">
        <h3 className="text-lg font-extrabold text-gray-900 mb-4">Security Infrastructure</h3>
        <div className="bg-gray-50 border border-gray-200/60 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
               <IconShield className="w-5 h-5 text-green-600" />
            </div>
            <div>
               <p className="text-base font-bold text-gray-900 mb-1">Bank-Grade Protection</p>
               <p className="text-sm font-medium text-gray-500 leading-relaxed">
                 Your active session is fully protected and secured via HTTP-only JWTs. Escrow protects all critical identifiers using standard hashing and encryption standards.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-[2rem] border-2 border-red-50 p-8">
        <h3 className="text-lg font-extrabold text-red-700 mb-4">Danger Zone</h3>
        <div className="flex items-center justify-between p-6 bg-red-50/50 rounded-2xl border border-red-100">
          <div>
            <p className="text-base font-bold text-gray-900">Sign out of active session</p>
            <p className="text-sm font-medium text-gray-500 mt-1">Safely destroy your local session keys and log out.</p>
          </div>
          <Button
            variant="secondary"
            className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 bg-white shadow-sm"
            icon={<IconLogout className="w-4 h-4" />}
            onClick={handleSignOut}
          >
            End Session
          </Button>
        </div>
      </div>
    </div>
  );
}
