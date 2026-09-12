const Stripe = require("stripe");

let stripe = null;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key || key === "sk_test_your_key_here") {
    return null;
  }

  if (!stripe) {
    stripe = new Stripe(key);
  }

  return stripe;
}

module.exports = { getStripe };
