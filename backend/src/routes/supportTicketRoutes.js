const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const checkAdminMiddleware = require("../middlewares/checkAdminMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const c = require("../controllers/supportTicketControllers");
const router = express.Router();

router.post("/", authMiddleware, asyncHandler(c.createTicket));
router.get("/my", authMiddleware, asyncHandler(c.getMyTickets));
router.get("/order/:orderId", authMiddleware, asyncHandler(c.getOrderTickets));
router.get("/", authMiddleware, checkAdminMiddleware, asyncHandler(c.getAllTickets));
router.put("/:ticketId", authMiddleware, checkAdminMiddleware, asyncHandler(c.updateTicket));
module.exports = router;
