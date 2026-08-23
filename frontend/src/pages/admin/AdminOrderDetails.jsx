import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import "./AdminOrderDetails.css";

function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const IMAGE_API = "http://localhost:4000/uploads/";

  // =====================================
  // GET SINGLE ORDER
  // =====================================

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

  // =====================================
  // UPDATE ORDER STATUS
  // =====================================

  async function handleUpdateStatus() {
    if (!status) {
      alert("Please select order status");
      return;
    }

    try {
      setUpdating(true);

      const response = await api.put("/orders/update", {
        orderId: id,
        status: status,
      });

      if (response.data.success) {
        alert("Order Status Updated Successfully");

        // Latest order data dobara fetch
        await getOrder();
      } else {
        alert(
          response.data.message ||
            "Failed to update order status"
        );
      }
    } catch (error) {
      console.log("Update Order Status Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdating(false);
    }
  }

  // =====================================
  // LOADING
  // =====================================

  if (!order) {
    return (
      <section className="adminOrderDetails">
        <div className="orderLoading">
          Loading Order...
        </div>
      </section>
    );
  }

  // =====================================
  // UI
  // =====================================

  return (
    <section className="adminOrderDetails">

      {/* ==============================
          HEADER
      ============================== */}

      <div className="orderDetailsHeader">

        <h2>Order Details</h2>

        <button
          className="backBtn"
          onClick={() => navigate(-1)}
        >
          Back
        </button>

      </div>

      {/* ==============================
          CUSTOMER DETAILS
      ============================== */}

      <div className="detailsCard">

        <h3>Customer Details</h3>

        <div className="detailRow">

          <div className="detailItem">
            <label>Order ID</label>
            <p>{order._id}</p>
          </div>

          <div className="detailItem">
            <label>Customer Name</label>
            <p>{order.userId?.name || "N/A"}</p>
          </div>

        </div>

        <div className="detailRow">

          <div className="detailItem">
            <label>Email</label>
            <p>{order.userId?.email || "N/A"}</p>
          </div>

          <div className="detailItem">
            <label>Contact Number</label>
            <p>
              {order.contactNumber ||
                order.userId?.contactNumber ||
                "N/A"}
            </p>
          </div>

        </div>

        <div className="detailRow">

          <div className="detailItem">
            <label>Shipping Address</label>
            <p>{order.shippingAddress || "N/A"}</p>
          </div>

        </div>

      </div>

      {/* ==============================
          PAYMENT DETAILS
      ============================== */}

      <div className="detailsCard">

        <h3>Payment Details</h3>

        <div className="detailRow">

          <div className="detailItem">
            <label>Total Amount</label>

            <p>
              ₹{" "}
              {Number(
                order.totalOrderValue || 0
              ).toLocaleString()}
            </p>
          </div>

          <div className="detailItem">
            <label>Payment Mode</label>

            <p>
              {order.paymentMode || "N/A"}
            </p>
          </div>

        </div>

        <div className="detailRow">

          <div className="detailItem">
            <label>Payment Status</label>

            <p
              className={
                order.paymentStatus === "completed"
                  ? "paymentCompleted"
                  : "paymentPending"
              }
            >
              {order.paymentStatus || "pending"}
            </p>
          </div>

          <div className="detailItem">

            <label>Current Order Status</label>

            <span
              className={`status ${order.orderStatus}`}
            >
              {order.orderStatus}
            </span>

          </div>

        </div>

      </div>

      {/* ==============================
          UPDATE ORDER STATUS
      ============================== */}

      <div className="detailsCard statusUpdateCard">

        <h3>Update Order Status</h3>

        <div className="statusUpdate">

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >

            <option value="pending">
              Pending
            </option>

            <option value="shipped">
              Shipped
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="cancelled">
              Cancelled
            </option>

            <option value="returned">
              Returned
            </option>

          </select>

          <button
            className="updateStatusBtn"
            onClick={handleUpdateStatus}
            disabled={
              updating ||
              status === order.orderStatus
            }
          >
            {updating
              ? "Updating..."
              : "Update Status"}
          </button>

        </div>

      </div>

      {/* ==============================
          ORDERED PRODUCTS
      ============================== */}

      <div className="detailsCard">

        <h3>Ordered Products</h3>

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

                const price = Number(
                  product?.price || 0
                );

                const quantity = Number(
                  item.quantity || 1
                );

                return (
                  <tr key={item._id}>

                    <td>

                      {product?.images?.length > 0 ? (
                        <img
                          src={
                            IMAGE_API +
                            product.images[0]
                          }
                          alt={
                            product?.title ||
                            "Product"
                          }
                          className="productImage"
                        />
                      ) : (
                        <span>
                          No Image
                        </span>
                      )}

                    </td>

                    <td>
                      {product?.title || "N/A"}
                    </td>

                    <td>
                      ₹{" "}
                      {price.toLocaleString()}
                    </td>

                    <td>
                      {quantity}
                    </td>

                    <td>
                      ₹{" "}
                      {(
                        price * quantity
                      ).toLocaleString()}
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