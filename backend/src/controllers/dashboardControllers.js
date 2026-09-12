const Product = require("../models/productsModel");
const User = require("../models/userModel");
const Order = require("../models/ordersModel");

// ======================================
// ADMIN DASHBOARD
// ======================================

async function getDashboardData(req, res) {
  try {
    // ==============================
    // TOTAL PRODUCTS
    // ==============================

    const totalProducts =
      await Product.countDocuments();

    // ==============================
    // TOTAL USERS
    // ==============================

    const totalUsers =
      await User.countDocuments({
        role: { $ne: "admin" },
      });

    // ==============================
    // TOTAL ORDERS
    // ==============================

    const totalOrders =
      await Order.countDocuments();

    // ==============================
    // PENDING ORDERS
    // ==============================

    const pendingOrders =
      await Order.countDocuments({
        orderStatus: "pending",
      });

    // ==============================
    // DELIVERED ORDERS
    // ==============================

    const deliveredOrders =
      await Order.countDocuments({
        orderStatus: "delivered",
      });

    // ==============================
    // CANCELLED ORDERS
    // ==============================

    const cancelledOrders =
      await Order.countDocuments({
        orderStatus: "cancelled",
      });

    // ==============================
    // TOTAL REVENUE
    // ==============================

    const revenueData =
      await Order.aggregate([
        {
          $match: {
            paymentStatus: {
              $in: [
                "paid",
                "completed",
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$totalOrderValue",
            },
          },
        },
      ]);

    const totalRevenue =
      revenueData.length > 0
        ? revenueData[0].totalRevenue
        : 0;

    const paymentSummary = await Order.aggregate([
      { $group: { _id: "$paymentStatus", count: { $sum: 1 }, amount: { $sum: "$totalOrderValue" } } },
    ]);
    const paymentStats = paymentSummary.reduce((result, item) => {
      result[item._id] = { count: item.count, amount: item.amount };
      return result;
    }, {});
    const [onlinePayments, codPayments] = await Promise.all([
      Order.countDocuments({ paymentProvider: "stripe" }),
      Order.countDocuments({ paymentProvider: "cod" }),
    ]);

    // ==============================
    // RECENT ORDERS
    // ==============================

    const recentOrders =
      await Order.find({})
        .populate(
          "userId",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5);

    // ==============================
    // RESPONSE
    // ==============================

    return res.status(200).send({
      success: true,
      message:
        "Dashboard Data Fetched Successfully",

      data: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,

        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        paymentStats,
        onlinePayments,
        codPayments,

        recentOrders,
      },
    });

  } catch (error) {

    console.log(
      "Dashboard Error:",
      error
    );

    return res.status(500).send({
      success: false,
      message:
        "Failed To Get Dashboard Data",
      error: error.message,
    });
  }
}

module.exports = {
  getDashboardData,
};
