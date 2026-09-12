const Order = require("../models/ordersModel");
const User = require("../models/userModel");
const { getStripe } = require("../services/payment/stripeClient");
const {
  buildOrderFromItems,
  validateCheckoutDetails,
} = require("../services/payment/orderPricingService");

function configuredStripe(res) {
  const stripe = getStripe();
  if (!stripe) {
    res.status(503).send({
      success: false,
      message: "Stripe is not configured. Add STRIPE_SECRET_KEY to backend/.env.",
    });
    return null;
  }
  return stripe;
}

async function createStripePaymentIntent(req, res) {
  const stripe = configuredStripe(res);
  if (!stripe) return;

  let order = null;
  try {
    const { items, shippingAddress, contactNumber, paymentMode } = req.body;
    validateCheckoutDetails({ shippingAddress, contactNumber });

    const selectedMode = paymentMode === "UPI" ? "UPI" : "Card";
    const { canonicalItems, totalOrderValue } = await buildOrderFromItems(items);
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    order = await Order.create({
      userId: user._id,
      items: canonicalItems,
      shippingAddress: shippingAddress.trim(),
      contactNumber: String(contactNumber).trim(),
      totalOrderValue,
      paymentMode: selectedMode,
      paymentStatus: "pending",
      paymentProvider: "stripe",
      orderStatus: "pending",
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalOrderValue * 100),
      currency: (process.env.STRIPE_CURRENCY || "inr").toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: String(order._id),
        userId: String(user._id),
      },
      description: `VestiQ order ${order._id}`,
    });

    order.stripePaymentIntentId = paymentIntent.id;
    order.stripePaymentStatus = paymentIntent.status;
    await order.save();

    return res.status(201).send({
      success: true,
      orderId: order._id,
      clientSecret: paymentIntent.client_secret,
      amount: totalOrderValue,
      currency: (process.env.STRIPE_CURRENCY || "inr").toUpperCase(),
    });
  } catch (error) {
    console.error("Create Stripe PaymentIntent Error:", error);
    // Do not leave an unusable pending order if Stripe rejects intent creation.
    if (order && !order.stripePaymentIntentId) {
      await Order.findByIdAndDelete(order._id);
    }
    return res.status(error.statusCode || 500).send({
      success: false,
      message: error.message || "Unable to start payment",
    });
  }
}

async function createCashOnDeliveryOrder(req, res) {
  try {
    const { items, shippingAddress, contactNumber } = req.body;
    validateCheckoutDetails({ shippingAddress, contactNumber });

    const { canonicalItems, totalOrderValue } = await buildOrderFromItems(items);
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    const order = await Order.create({
      userId: user._id,
      items: canonicalItems,
      shippingAddress: shippingAddress.trim(),
      contactNumber: String(contactNumber).trim(),
      totalOrderValue,
      paymentMode: "COD",
      paymentStatus: "pending",
      paymentProvider: "cod",
      orderStatus: "pending",
    });

    user.cart = [];
    await user.save();

    return res.status(201).send({
      success: true,
      message: "Cash on Delivery order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create COD Order Error:", error);
    return res.status(error.statusCode || 500).send({
      success: false,
      message: error.message || "Unable to place order",
    });
  }
}

async function getPaymentStatus(req, res) {
  const order = await Order.findOne({ _id: req.params.orderId, userId: req.user._id });

  if (!order) {
    return res.status(404).send({ success: false, message: "Order not found" });
  }

  return res.send({
    success: true,
    data: {
      orderId: order._id,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentProvider: order.paymentProvider,
      stripePaymentStatus: order.stripePaymentStatus,
      paymentFailureReason: order.paymentFailureReason,
    },
  });
}

async function stripeWebhook(req, res) {
  const stripe = configuredStripe(res);
  if (!stripe) return;

  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook signature verification failed: ${error.message}`);
  }

  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) return res.json({ received: true });

  const order = await Order.findById(orderId);
  if (!order || order.stripePaymentIntentId !== paymentIntent.id) {
    return res.json({ received: true });
  }

  if (event.type === "payment_intent.succeeded") {
    // The guard makes duplicate webhook deliveries safe.
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.stripePaymentStatus = paymentIntent.status;
      order.paidAt = new Date();
      order.paymentFailureReason = null;
      await order.save();

      // Clear only the quantities bought, leaving any unrelated cart additions intact.
      const user = await User.findById(order.userId);
      if (user) {
        const orderedQuantities = new Map();
        for (const item of order.items) {
          const key = `${item.productId.toString()}::${JSON.stringify(item.variant || {})}`;
          orderedQuantities.set(key, (orderedQuantities.get(key) || 0) + item.quantity);
        }

        user.cart = user.cart.reduce((remaining, item) => {
          const key = `${item.productId.toString()}::${JSON.stringify(item.variant || {})}`;
          const orderedQuantity = orderedQuantities.get(key) || 0;
          if (!orderedQuantity) {
            remaining.push(item);
          } else if (item.quantity > orderedQuantity) {
            item.quantity -= orderedQuantity;
            remaining.push(item);
            orderedQuantities.delete(key);
          } else if (item.quantity < orderedQuantity) {
            orderedQuantities.set(key, orderedQuantity - item.quantity);
          } else {
            orderedQuantities.delete(key);
          }
          return remaining;
        }, []);
        await user.save();
      }
    }
  } else if (event.type === "payment_intent.processing") {
    order.paymentStatus = "processing";
    order.stripePaymentStatus = paymentIntent.status;
    await order.save();
  } else if (event.type === "payment_intent.payment_failed" || event.type === "payment_intent.canceled") {
    order.paymentStatus = "failed";
    order.stripePaymentStatus = paymentIntent.status;
    order.paymentFailureReason = paymentIntent.last_payment_error?.message || "Payment was not completed";
    await order.save();
  }

  return res.json({ received: true });
}

module.exports = {
  createStripePaymentIntent,
  createCashOnDeliveryOrder,
  getPaymentStatus,
  stripeWebhook,
};
