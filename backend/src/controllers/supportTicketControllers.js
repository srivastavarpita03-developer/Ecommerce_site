const SupportTicket = require("../models/supportTicketModel");
const Order = require("../models/ordersModel");

async function createTicket(req, res) {
  const { orderId, type, reason } = req.body;
  if (!orderId || !["cancellation", "return", "refund"].includes(type) || !reason?.trim()) {
    return res.status(400).send({ success: false, message: "Order, request type, and reason are required" });
  }

  const order = await Order.findOne({ _id: orderId, userId: req.user._id });
  if (!order) return res.status(404).send({ success: false, message: "Order not found" });
  if (order.orderStatus === "cancelled" || order.orderStatus === "returned") {
    return res.status(409).send({ success: false, message: "This order is already closed" });
  }
  if (type === "cancellation" && !["pending", "shipped"].includes(order.orderStatus)) {
    return res.status(409).send({ success: false, message: "Cancellation can be requested only before delivery" });
  }
  if (type === "return" && order.orderStatus !== "delivered") {
    return res.status(409).send({ success: false, message: "Return can be requested only after delivery" });
  }
  if (type === "refund" && order.paymentStatus !== "paid") {
    return res.status(409).send({ success: false, message: "Refund can be requested only for a paid order" });
  }

  const existing = await SupportTicket.findOne({ orderId, type, status: "open" });
  if (existing) return res.status(409).send({ success: false, message: `An open ${type} ticket already exists: ${existing.ticketId}` });

  const ticket = await SupportTicket.create({ orderId, userId: req.user._id, type, reason: reason.trim() });
  return res.status(201).send({ success: true, message: `Request created. Ticket ID: ${ticket.ticketId}`, data: ticket });
}

async function getMyTickets(req, res) {
  const tickets = await SupportTicket.find({ userId: req.user._id }).populate("orderId", "orderStatus totalOrderValue paymentStatus").sort({ createdAt: -1 });
  return res.send({ success: true, data: tickets });
}

async function getOrderTickets(req, res) {
  const order = await Order.findOne({ _id: req.params.orderId, userId: req.user._id }).select("_id");
  if (!order) return res.status(404).send({ success: false, message: "Order not found" });
  const tickets = await SupportTicket.find({ orderId: order._id }).sort({ createdAt: -1 });
  return res.send({ success: true, data: tickets });
}

async function getAllTickets(req, res) {
  const tickets = await SupportTicket.find({}).populate("userId", "name email").populate("orderId", "orderStatus totalOrderValue paymentStatus").sort({ createdAt: -1 });
  return res.send({ success: true, data: tickets });
}

async function updateTicket(req, res) {
  const { status, adminNote } = req.body;
  if (!["approved", "rejected", "resolved"].includes(status)) {
    return res.status(400).send({ success: false, message: "Choose an approved, rejected, or resolved status" });
  }
  const ticket = await SupportTicket.findById(req.params.ticketId);
  if (!ticket) return res.status(404).send({ success: false, message: "Ticket not found" });

  ticket.status = status;
  ticket.adminNote = typeof adminNote === "string" ? adminNote.trim() : ticket.adminNote;
  if (status === "resolved") ticket.resolvedAt = new Date();
  await ticket.save();

  // Approval changes order fulfilment state. A refund payment is deliberately
  // not automatically sent: an admin must verify goods/payment before refunding.
  if (status === "approved") {
    if (ticket.type === "cancellation") await Order.findByIdAndUpdate(ticket.orderId, { orderStatus: "cancelled" });
    if (ticket.type === "return") await Order.findByIdAndUpdate(ticket.orderId, { orderStatus: "returned" });
  }
  return res.send({ success: true, message: "Ticket updated", data: ticket });
}

module.exports = { createTicket, getMyTickets, getOrderTickets, getAllTickets, updateTicket };
