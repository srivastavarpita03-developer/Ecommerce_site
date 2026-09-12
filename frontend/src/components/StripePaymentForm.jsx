import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function StripePaymentForm({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    setError("");
    const { error: submitError } = await elements.submit();

    if (submitError) {
      setError(submitError.message || "Please check your payment details.");
      setSubmitting(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/complete?orderId=${orderId}`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment could not be completed.");
      setSubmitting(false);
      return;
    }

    navigate(`/payment/complete?orderId=${orderId}`, { replace: true });
  }

  return (
    <form onSubmit={handleSubmit} className="stripePaymentForm">
      <PaymentElement />
      {error && <p className="stripePaymentError">{error}</p>}
      <button className="placeOrderBtn" type="submit" disabled={!stripe || submitting}>
        {submitting ? "Confirming payment..." : "Pay securely"}
      </button>
    </form>
  );
}

export default StripePaymentForm;
