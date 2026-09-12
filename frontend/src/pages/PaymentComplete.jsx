import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import Swal from "sweetalert2";

function PaymentComplete() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get("orderId");
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Confirming your payment...");
  const paymentSuccessShown = useRef(false);
  const pollTimer = useRef(null);

  const checkPaymentStatus = useCallback(async () => {
    if (!orderId) return;

    try {
      const response = await api.get(`/payments/orders/${orderId}/status`);
      const payment = response.data.data;

      // `paid` is set exclusively by the verified Stripe webhook on the server.
      if (payment.paymentStatus === "paid") {
        setStatus("paid");
        setMessage("Payment received. Your order has been confirmed.");
        if (!paymentSuccessShown.current) {
          paymentSuccessShown.current = true;
          void Swal.fire({
            icon: "success",
            title: "Payment successful",
            text: "Your payment was confirmed by Stripe and your order is confirmed.",
            confirmButtonText: "View order",
          });
        }
        return "complete";
      }

      if (payment.paymentStatus === "failed") {
        setStatus("failed");
        setMessage(payment.paymentFailureReason || "Your payment was not completed.");
        return "complete";
      }

      setStatus("processing");
      setMessage("Waiting for Stripe to confirm your payment. Please do not close this page.");
      return "pending";
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.message || "Unable to check payment status.");
      return "complete";
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return undefined;

    let active = true;
    const poll = async () => {
      const result = await checkPaymentStatus();
      if (active && result === "pending") {
        pollTimer.current = setTimeout(poll, 2000);
      }
    };
    poll();

    return () => {
      active = false;
      clearTimeout(pollTimer.current);
    };
  }, [checkPaymentStatus, orderId]);

  if (!orderId) {
    return (
      <section className="checkout">
        <div className="checkoutContainer"><div className="checkoutError">
          <h2>Payment status</h2><p>No order was supplied for this payment.</p>
          <button type="button" onClick={() => navigate("/orders")}>View orders</button>
        </div></div>
      </section>
    );
  }

  return (
    <section className="checkout">
      <div className="checkoutContainer">
        <div className="checkoutError">
          <h2>
            {status === "paid"
              ? "Payment successful"
              : status === "failed"
                ? "Payment failed"
                : "Payment confirmation"}
          </h2>
          <p>{message}</p>
          {status === "processing" || status === "checking" ? (
            <button type="button" onClick={checkPaymentStatus}>Check again</button>
          ) : (
            <button type="button" onClick={() => navigate(`/orders/${orderId}`)}>
              View order
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default PaymentComplete;
