import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import "./AdminOrderDetails.css";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiDollarSign,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiEdit3,
} from "react-icons/fi";

function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const IMAGE_API = "http://localhost:4000/uploads/";

  async function getOrder() {
    try {
      const response = await api.get(`/orders/${id}`);
      if (response.data.success) {
        const orderData = response.data.data;
        setOrder(orderData);
        setStatus(orderData.orderStatus);
      }
    } catch (error) {
      console.log("Get Order Error:", error);
      if (error.response?.status === 401) {
        alert("Unauthorized Access");
        navigate("/login");
      } else if (error.response?.status === 404) {
        alert("Order not found");
        navigate(-1);
      } else {
        alert("Failed to load order");
      }
    }
  }

  useEffect(() => {
    getOrder();
  }, [id]);

  async function handleUpdateStatus() {
    if (!status) {
      alert("Please select order status");
      return;
    }

    try {
      setUpdating(true);
      const response = await api.put("/orders/status", {
        orderId: id,
        status: status,
      });

      if (response.data.success) {
        alert("Order Status Updated Successfully");
        await getOrder();
      } else {
        alert(response.data.message || "Failed to update order status");
      }
    } catch (error) {
      console.log("Update Order Status Error:", error);
      alert(error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  }

  if (!order) {
    return (
      <section className="adminOrderDetails">
        <div className="orderLoading">
          <div className="orderLoader" />
          <p>Loading Order...</p>
        </div>
      </section>
    );
  }

  const totalItems = order.items?.length || 0;
  const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <section className="adminOrderDetails">

      {/* HEADER */}
      <div className="orderDetailsHeader">
        <div className="orderHeaderLeft">
          <button className="backBtn" onClick={() => navigate(-1)}>
            <FiArrowLeft />
          </button>
          <div>
            <h2>Order Details</h2>
            <p className="orderHeaderCode">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
        <span className={`statusBadge ${order.orderStatus}`}>
          {order.orderStatus}
        </span>
      </div>

      {/* TOP GRID: Customer + Payment */}
      <div className="orderTopGrid">

        {/* CUSTOMER DETAILS */}
        <div className="detailsCard">
          <div className="cardHeader">
            <FiUser className="cardIcon" />
            <h3>Customer Details</h3>
          </div>

          <div className="detailRows">
            <div className="detailItem">
              <div className="detailLabel">
                <FiUser /> Customer Name
              </div>
              <p className="detailValue">{order.userId?.name || "N/A"}</p>
            </div>

            <div className="detailItem">
              <div className="detailLabel">
                <FiMail /> Email
              </div>
              <p className="detailValue">{order.userId?.email || "N/A"}</p>
            </div>

            <div className="detailItem">
              <div className="detailLabel">
                <FiPhone /> Contact Number
              </div>
              <p className="detailValue">
                {order.contactNumber || order.userId?.contactNumber || "N/A"}
              </p>
            </div>

            <div className="detailItem full">
              <div className="detailLabel">
                <FiMapPin /> Shipping Address
              </div>
              <p className="detailValue">{order.shippingAddress || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* PAYMENT DETAILS */}
        <div className="detailsCard">
          <div className="cardHeader">
            <FiCreditCard className="cardIcon" />
            <h3>Payment Details</h3>
          </div>

          <div className="detailRows">
            <div className="detailItem">
              <div className="detailLabel">
                <FiDollarSign /> Total Amount
              </div>
              <p className="detailValue price">
                ₹{Number(order.totalOrderValue || 0).toLocaleString()}
              </p>
            </div>

            <div className="detailItem">
              <div className="detailLabel">
                <FiCreditCard /> Payment Mode
              </div>
              <p className="detailValue">{order.paymentMode || "N/A"}</p>
            </div>

            <div className="detailItem">
              <div className="detailLabel">Payment Status</div>
              <span className={`paymentBadge ${order.paymentStatus || "pending"}`}>
                {order.paymentStatus || "pending"}
              </span>
            </div>

            <div className="detailItem">
              <div className="detailLabel">Order Date</div>
              <p className="detailValue">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* UPDATE STATUS */}
      <div className="detailsCard statusUpdateCard">
        <div className="cardHeader">
          <FiEdit3 className="cardIcon" />
          <h3>Update Order Status</h3>
        </div>

        <div className="statusUpdateRow">
          <div className="statusSelectWrap">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          <button
            className="updateStatusBtn"
            onClick={handleUpdateStatus}
            disabled={updating || status === order.orderStatus}
          >
            {updating ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>

      {/* ORDERED PRODUCTS */}
      <div className="detailsCard">
        <div className="cardHeader">
          <FiPackage className="cardIcon" />
          <h3>Ordered Products</h3>
          <span className="productCount">{totalItems} items · {totalQuantity} qty</span>
        </div>

        <div className="productTableWrapper">
          <table className="productTable">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => {
                const product = item.productId;
                const price = Number(product?.price || 0);
                const quantity = Number(item.quantity || 1);

                return (
                  <tr key={item._id}>
                    <td>
                      {product?.images?.length > 0 ? (
                        <img
                          src={IMAGE_API + product.images[0]}
                          alt={product?.title || "Product"}
                          className="productImage"
                        />
                      ) : (
                        <div className="noImage">No Image</div>
                      )}
                    </td>
                    <td>
                      <span className="productTitle">{product?.title || "N/A"}</span>
                    </td>
                    <td>₹{price.toLocaleString()}</td>
                    <td>{quantity}</td>
                    <td>
                      <strong>₹{(price * quantity).toLocaleString()}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
}

export default AdminOrderDetails;
