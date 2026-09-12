const mongoose = require("mongoose");

const supportTicketSchema = mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
      default: () => `VQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "order", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    type: { type: String, enum: ["cancellation", "return", "refund"], required: true },
    reason: { type: String, required: true, maxlength: 1000 },
    status: { type: String, enum: ["open", "approved", "rejected", "resolved"], default: "open" },
    adminNote: { type: String, default: "", maxlength: 1000 },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("supportTicket", supportTicketSchema);
