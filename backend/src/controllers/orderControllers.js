const Order = require("../models/ordersModel");

async function getAllOrders(req, res) {
  const allOrders = await Order.find({});
  return res.send({
    success: true,
    message: "Success",
    data: allOrders,
  });
}

async function getUserOrders(req, res) {
  const userData = req.user;
  const userId = userData._id;
  const userOrders = await Order.find({ userId: userId }).populate("items");
  return res.send({
    success: true,
    message: "Success",
    data: userOrders,
  });
}

async function createOrder(req, res) {
  const userData = req.user;
  const userId = userData._id;
  const data = req.body;
  const {
    items,
    shippingAddress,
    totalOrderValue,
    payementMode,
    paymentStatus,
  } = data;
  const newOrder = new Order({
    userId,
    items,
    shippingAddress,
    totalOrderValue,
    payementMode,
    paymentStatus,
    deliveredAt: null,
  });
  const newOrderData = await newOrder.save();
  return res.send({
    success: true,
    message: "Order Placed Successfully",
    data: newOrderData,
  });
}

async function updateOrder(req, res) {
  const data = req.body;
  const { orderId, status } = data;
  let deliveredAt = null;
  if (status == "delivered") {
    deliveredAt = Date.now();
  }
  const updatedOrderData = await Order.findByIdAndUpdate(orderId, {
    orderStatus: status,
    deliveredAt,
  });
  return res.send({
    success: true,
    message: "Order Status Updated",
    data: updatedOrderData,
  });
}

module.exports = {
  getAllOrders,
  getUserOrders,
  createOrder,
  updateOrder,
};
