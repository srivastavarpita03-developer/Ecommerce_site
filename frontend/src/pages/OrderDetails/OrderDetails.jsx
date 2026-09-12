
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";
import "./OrderDetails.css";

function OrderDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);

  // ======================================
  // GET ORDER DETAILS
  // ======================================

  async function getOrderDetails() {
    try {
      setLoading(true);

      console.log(
        "Getting Order Details:",
        id
      );

      const response = await api.get(
        // Customer orders must use the ownership-checked customer endpoint.
        // `/orders/:id` is intentionally reserved for admins.
        `/orders/user-orders/${id}`
      );

      console.log(
        "Order Details Response:",
        response.data
      );

      const res = response.data;

      if (res.success) {
        setOrder(res.data);
        const ticketsResponse = await api.get(`/support-tickets/order/${id}`);
        setTickets(ticketsResponse.data.data || []);
      } else {
        alert(
          res.message ||
            "Order not found"
        );
      }
    } catch (error) {
      console.log(
        "Order Details Error:",
        error
      );

      if (error.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
        navigate("/login");
        return;
      }

      if (error.response?.status === 404) {
        alert("This order was not found or does not belong to your account.");
        navigate("/orders");
        return;
      }

      alert(
        error.response?.data?.message ||
          "Failed to load order details"
      );
    } finally {
      setLoading(false);
    }
  }

  async function createSupportTicket(type) {
    const { value: reason } = await Swal.fire({
      title: `Request ${type}`,
      input: "textarea",
      inputLabel: "Tell us why you need help",
      inputPlaceholder: "Write your reason here...",
      showCancelButton: true,
      confirmButtonText: "Create ticket",
      inputValidator: (value) => !value?.trim() && "A reason is required",
    });
    if (!reason) return;
    try {
      const response = await api.post("/support-tickets", { orderId: id, type, reason });
      await Swal.fire({ icon: "success", title: "Ticket created", text: response.data.message });
      const ticketsResponse = await api.get(`/support-tickets/order/${id}`);
      setTickets(ticketsResponse.data.data || []);
    } catch (error) {
      await Swal.fire({ icon: "error", title: "Request not created", text: error.response?.data?.message || "Please try again." });
    }
  }

  // ======================================
  // LOAD ORDER
  // ======================================

  useEffect(() => {
    getOrderDetails();
  }, [id]);

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <section className="orderDetailsPage">

        <div className="orderDetailsContainer">

          <h2>
            Loading Order Details...
          </h2>

        </div>

      </section>
    );
  }

  // ======================================
  // ORDER NOT FOUND
  // ======================================

  if (!order) {
    return (
      <section className="orderDetailsPage">

        <div className="orderDetailsContainer">

          <h2>
            Order Not Found
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate("/orders")
            }
          >
            Back to Orders
          </button>

        </div>

      </section>
    );
  }

  // ======================================
  // IMAGE API
  // ======================================

  const IMAGE_API =
    "http://localhost:4000/uploads/";

  // ======================================
  // RETURN UI
  // ======================================

  return (
    <section className="orderDetailsPage">

      <div className="orderDetailsContainer">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="orderDetailsHeader">

          <div>

            <h1>
              Order Details
            </h1>

            <p>
              Order #
              {order._id}
            </p>

          </div>

          <span
            className={`orderStatus ${order.orderStatus}`}
          >
            {order.orderStatus}
          </span>

        </div>

        {/* ======================================
            ORDER DATE
        ====================================== */}

        <div className="orderInfoCard">

          <h2>
            Order Information
          </h2>

          <div className="infoGrid">

            <div>
              <span>
                Order ID
              </span>

              <strong>
                {order._id}
              </strong>
            </div>

            <div>
              <span>
                Order Date
              </span>

              <strong>
                {new Date(
                  order.createdAt
                ).toLocaleDateString()}
              </strong>
            </div>

            <div>
              <span>
                Order Status
              </span>

              <strong
                className={`statusText ${order.orderStatus}`}
              >
                {order.orderStatus}
              </strong>
            </div>

            <div>
              <span>
                Payment Status
              </span>

              <strong>
                {order.paymentStatus ||
                  "Pending"}
              </strong>
            </div>

          </div>

        </div>

        <div className="orderInfoCard supportCard">
          <h2>Order Support</h2>
          <p className="supportIntro">Create a support request and track it with the ticket ID.</p>
          <div className="supportActions">
            {['pending', 'shipped'].includes(order.orderStatus) && <button type="button" onClick={() => createSupportTicket("cancellation")}>Request cancellation</button>}
            {order.orderStatus === 'delivered' && <button type="button" onClick={() => createSupportTicket("return")}>Request return</button>}
            {order.paymentStatus === 'paid' && <button type="button" onClick={() => createSupportTicket("refund")}>Request refund</button>}
          </div>
          {tickets.length > 0 ? (
            <div className="ticketList">
              {tickets.map((ticket) => <div className="ticketRow" key={ticket._id}>
                <div><strong>{ticket.ticketId}</strong><span>{ticket.type} request</span></div>
                <span className={`ticketStatus ${ticket.status}`}>{ticket.status}</span>
              </div>)}
            </div>
          ) : <p className="noTickets">No support tickets for this order.</p>}
        </div>

        {/* ======================================
            PRODUCTS
        ====================================== */}

        <div className="orderInfoCard">

          <h2>
            Ordered Products
          </h2>

          <div className="productsList">

            {order.items?.map(
              (item, index) => {

                const product =
                  item.productId;

                if (!product) {
                  return (
                    <div
                      className="productDetailItem"
                      key={index}
                    >
                      Product unavailable
                    </div>
                  );
                }

                const price =
                  Number(
                    product.price || 0
                  );

                const quantity =
                  Number(
                    item.quantity || 1
                  );

                const itemTotal =
                  price * quantity;

                return (
                  <div
                    className="productDetailItem"
                    key={
                      item._id ||
                      index
                    }
                  >

                    {/* IMAGE */}

                    <div className="productImageBox">

                      {product.images?.[0] ? (
                        <img
                          src={
                            IMAGE_API +
                            product.images[0]
                          }
                          alt={
                            product.title
                          }
                        />
                      ) : (
                        <div className="noImage">
                          No Image
                        </div>
                      )}

                    </div>

                    {/* PRODUCT INFO */}

                    <div className="productDetailInfo">

                      <h3>
                        {product.title}
                      </h3>

                      <p>
                        Price: ₹{" "}
                        {price.toLocaleString()}
                      </p>

                      <p>
                        Quantity:{" "}
                        {quantity}
                      </p>

                    </div>

                    {/* TOTAL */}

                    <div className="productItemTotal">

                      ₹{" "}
                      {itemTotal.toLocaleString()}

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* ======================================
            SHIPPING DETAILS
        ====================================== */}

        <div className="orderInfoCard">

          <h2>
            Shipping Details
          </h2>

          <div className="infoGrid">

            <div className="fullWidth">

              <span>
                Shipping Address
              </span>

              <strong>
                {order.shippingAddress ||
                  "N/A"}
              </strong>

            </div>

            <div>

              <span>
                Contact Number
              </span>

              <strong>
                {order.contactNumber ||
                  "N/A"}
              </strong>

            </div>

          </div>

        </div>

        {/* ======================================
            PAYMENT DETAILS
        ====================================== */}

        <div className="orderInfoCard">

          <h2>
            Payment Details
          </h2>

          <div className="infoGrid">

            <div>

              <span>
                Payment Mode
              </span>

              <strong>
                {order.paymentMode ||
                  "N/A"}
              </strong>

            </div>

            <div>

              <span>
                Payment Status
              </span>

              <strong>
                {order.paymentStatus ||
                  "Pending"}
              </strong>

            </div>

          </div>

        </div>

        {/* ======================================
            TOTAL
        ====================================== */}

        <div className="orderFinalTotal">

          <span>
            Total Order Amount
          </span>

          <strong>
            ₹{" "}
            {Number(
              order.totalOrderValue ||
                0
            ).toLocaleString()}
          </strong>

        </div>

        {/* ======================================
            BACK BUTTON
        ====================================== */}

        <button
          type="button"
          className="backToOrdersButton"
          onClick={() =>
            navigate("/orders")
          }
        >
          ← Back to My Orders
        </button>

      </div>

    </section>
  );
}

export default OrderDetails;

