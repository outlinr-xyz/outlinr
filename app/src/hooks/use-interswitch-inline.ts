import { useState, useCallback, useEffect } from "react";
import { api } from "../services/api-client";

export interface InitPaymentResponse {
  productId: string;
  payItemId: string;
  amount: string;
  currency: string;
  siteRedirectUrl: string;
  txnRef: string;
  hash: string;
  custId: string;
  custIdDesc: string;
  custName: string;
  custEmail: string;
  actionUrl: string;
}

declare global {
  interface Window {
    webpayCheckout: (payload: Record<string, unknown>) => void;
  }
}

/** Wait for the Interswitch SDK to be ready, with a timeout. */
function waitForSdk(timeoutMs = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && "webpayCheckout" in window) {
      resolve();
      return;
    }
    const deadline = Date.now() + timeoutMs;
    const check = setInterval(() => {
      if ("webpayCheckout" in window) {
        clearInterval(check);
        resolve();
      } else if (Date.now() > deadline) {
        clearInterval(check);
        reject(new Error("Interswitch checkout SDK did not load in time. Please refresh and try again."));
      }
    }, 100);
  });
}

export function useInterswitchInline<T = any>(escrowId?: string, onPaymentSuccess?: (data?: T) => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  // Check SDK availability on mount and whenever the component mounts
  useEffect(() => {
    let cancelled = false;
    waitForSdk()
      .then(() => { if (!cancelled) setSdkReady(true); })
      .catch(() => { /* SDK not available — error will surface at payment time */ });
    return () => { cancelled = true; };
  }, []);

  const openModal = useCallback((payload: InitPaymentResponse, onComplete: (res: Record<string, unknown>) => void) => {
    window.webpayCheckout({
      merchant_code: payload.productId,
      pay_item_id: payload.payItemId,
      site_redirect_url: payload.siteRedirectUrl,
      cust_id: payload.custId,
      cust_id_desc: payload.custIdDesc,
      cust_name: payload.custName,
      cust_email: payload.custEmail,
      txn_ref: payload.txnRef,
      amount: payload.amount,
      currency: parseInt(payload.currency),
      onComplete,
      mode: "TEST",
    });
  }, []);

  const verifyPayment = useCallback(async (txnRef: string, amount: number, finalId: string) => {
    try {
      await api(`/payments/verify/${finalId}`, {
        method: "POST",
        body: JSON.stringify({ txnRef, amount }),
      });
      setLoading(false);
      onPaymentSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setLoading(false);
    }
  }, [onPaymentSuccess]);

  const verifyAndCreate = useCallback(async (txnRef: string, amount: number, escrowData: unknown) => {
    try {
      const response = await api<T>("/escrows/verify-and-create", {
        method: "POST",
        body: JSON.stringify({ txnRef, amount, escrowData }),
      });
      setLoading(false);
      onPaymentSuccess?.(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Creation failed");
      setLoading(false);
    }
  }, [onPaymentSuccess]);


  const initiatePayment = useCallback(async (targetId?: string) => {
    const finalId = targetId || escrowId;
    if (!finalId) return;

    setLoading(true);
    setError(null);

    try {
      await waitForSdk();
    } catch (sdkErr) {
      setError(sdkErr instanceof Error ? sdkErr.message : "SDK not loaded");
      setLoading(false);
      return;
    }

    try {
      const payload = await api<InitPaymentResponse>(`/payments/init/${finalId}`);

      openModal(payload, async (response) => {
        if (response && response.resp === "00") {
          await verifyPayment(payload.txnRef, parseInt(payload.amount), finalId);
        } else {
          setError("Payment not completed.");
          setLoading(false);
        }
      });
    } catch {
      setError("Failed to initiate payment");
      setLoading(false);
    }
  }, [escrowId, openModal, verifyPayment]);

  const initiateNewPayment = useCallback(async (escrowData: unknown) => {
    setLoading(true);
    setError(null);

    try {
      await waitForSdk();
    } catch (sdkErr) {
      setError(sdkErr instanceof Error ? sdkErr.message : "SDK not loaded");
      setLoading(false);
      return;
    }

    try {
      const payload = await api<InitPaymentResponse>("/payments/init-new", {
        method: "POST",
        body: JSON.stringify(escrowData),
      });

      openModal(payload, async (response) => {
        if (response && response.resp === "00") {
          await verifyAndCreate(payload.txnRef, parseInt(payload.amount), escrowData);
        } else {
          setError("Payment not completed.");
          setLoading(false);
        }
      });
    } catch {
      setError("Failed to initiate payment");
      setLoading(false);
    }
  }, [openModal, verifyAndCreate]);

  return { initiatePayment, initiateNewPayment, loading, error, sdkReady };
}
