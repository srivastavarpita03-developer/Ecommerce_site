import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminOrders.css";
import api from "../../utils/api";

const orders = [
  {
    _id: "ORD-1001",
    customer: "User 1",
    totalOrderValue: 24500,
    paymentStatus: "completed",
    payementMode: "UPI",
    orderStatus: "pending",
    createdAt: "14 Jul 2026",
  },
  {
    _id: "ORD-1002",
    customer: "Rahul Sharma",
    totalOrderValue: 18999,
    paymentStatus: "completed",
    payementMode: "COD",
    orderStatus: "shipped",
    createdAt: "13 Jul 2026",
  },
  {
    _id: "ORD-1003",
    customer: "Priya Singh",
    totalOrderValue: 32000,
    paymentStatus: "pending",
    payementMode: "Card",
    orderStatus: "pending",
    createdAt: "12 Jul 2026",
  },
  {
    _id: "ORD-1004",
    customer: "Ankit Verma",
    totalOrderValue: 54000,
    paymentStatus: "completed",
    payementMode: "UPI",
    orderStatus: "delivered",
    createdAt: "10 Jul 2026",
  },
];

function AdminOrders() {
  const navigate = useNavigate();

  const [ordersData, setOrderData] = useState([]);

  async function getData() {
    const response = await api.get("/orders/all");
    const res = response.data;

    if (res?.success) {
      console.log(res);
      setOrderData(res.data);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <section className="adminOrders">
      <div className="ordersHeader">
        <h1>Orders</h1>
      </div>

      <div className="tableWrapper">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {ordersData.map((order) => (
              <tr key={order?._id}>
                <td>{order?._id}</td>

                <td>{order?.createdAt}</td>

                <td>{order?.userId?.name}</td>

                <td>₹ {order?.items?.[0]?.productId?.price}</td>

                <td>{order?.paymentStatus || "Pending"}</td>

                <td>{order?.payementMode || "N/A"}</td>

                <td>
                  <span className={`status ${order?.orderStatus}`}>
                    {order?.orderStatus}
                  </span>
                </td>

                <td>
                  <button
                    className="viewBtn"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminOrders;