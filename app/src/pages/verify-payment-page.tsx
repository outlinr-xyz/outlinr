import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { api } from "../services/api-client";
import { Button } from "../components/common/button";
import { IconCheck, IconX } from "../components/common/icons";

export default function VerifyPaymentPage() {
    const { id } = useParams(); // 'new' or UUID
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [error, setError] = useState<string | null>(null);

    const txnRef = searchParams.get("txnRef") || searchParams.get("transactionreference");

    useEffect(() => {
        async function completeProcess() {
            if (!txnRef) {
                setStatus("error");
                setError("No transaction reference found in URL.");
                return;
            }

            try {
                if (id === "new") {
                    // Handle Atomic Create-after-Funded
                    const savedData = localStorage.getItem("pending_escrow_data");
                    if (!savedData) {
                        throw new Error("Escrow data not found. Please try creating again.");
                    }
                    const escrowData = JSON.parse(savedData);

                    // We need amount too. Interswitch usually passes it or we get it from payload if we save it.
                    const savedAmount = localStorage.getItem("pending_payment_amount");
                    const amount = savedAmount ? parseInt(savedAmount) : escrowData.amount * 100;

                    const result = await api<any>("/escrows/verify-and-create", {
                        method: "POST",
                        body: JSON.stringify({ txnRef, amount, escrowData }),
                    });

                    localStorage.removeItem("pending_escrow_data");
                    localStorage.removeItem("pending_payment_amount");
                    
                    setStatus("success");
                    // Wait a bit then redirect
                    setTimeout(() => navigate(`/escrow/${result.id}/dashboard`), 2000);
                } else {
                    // Handle Existing Escrow Funding
                    const savedAmount = localStorage.getItem("pending_payment_amount");
                    if (!savedAmount) {
                         throw new Error("Payment details missing.");
                    }
                    
                    await api(`/payments/verify/${id}`, {
                        method: "POST",
                        body: JSON.stringify({ txnRef, amount: parseInt(savedAmount) }),
                    });

                    localStorage.removeItem("pending_payment_amount");
                    setStatus("success");
                    setTimeout(() => navigate(`/escrow/${id}/dashboard`), 2000);
                }
            } catch (err) {
                console.error("Verification error:", err);
                setStatus("error");
                setError(err instanceof Error ? err.message : "Failed to verify payment.");
            }
        }

        completeProcess();
    }, [id, txnRef, navigate]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[2rem] shadow-card p-10 text-center border border-gray-100">
                {status === "verifying" && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="w-16 h-16 border-4 border-gray-100 border-t-primary-500 rounded-full animate-spin mx-auto drop-shadow-sm" />
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Finalizing escrow...</h1>
                            <p className="text-base font-medium text-gray-500 mt-3 leading-relaxed">We're verifying your payment and securing the funds globally. Please wait.</p>
                        </div>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-8 animate-fade-in flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] border-4 border-emerald-100 flex items-center justify-center mx-auto shadow-sm">
                            <IconCheck className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Payment Secured!</h1>
                            <p className="text-base font-medium text-gray-500 mt-3 leading-relaxed">Your escrow has been successfully funded. Redirecting to your secure vault...</p>
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] border-4 border-red-100 flex items-center justify-center mx-auto shadow-sm">
                            <IconX className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Verification Failed</h1>
                            <p className="text-sm font-bold text-red-500 mt-3 leading-relaxed bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>
                        </div>
                        <div className="pt-4 flex flex-col gap-4">
                            <Button onClick={() => navigate("/")} variant="outline" className="w-full h-14 rounded-[1.25rem] text-base font-bold text-gray-500 border-2 border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:bg-white transition-all">
                                Return to Dashboard
                            </Button>
                            <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest leading-relaxed">
                                If charged, note reference: <br/>
                                <span className="font-mono text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 inline-block mt-3 opacity-80">{txnRef}</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
