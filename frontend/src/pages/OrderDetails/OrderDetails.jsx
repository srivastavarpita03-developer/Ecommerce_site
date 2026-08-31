
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import "./OrderDetails.css";

function OrderDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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
        `/orders/${id}`
      );

      console.log(
        "Order Details Response:",
        response.data
      );

      const res = response.data;

      if (res.success) {
        setOrder(res.data);
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

      if (
        error.response?.status === 401 ||
        error.response?.status === 400
      ) {
        alert("Please login first");

        navigate("/login");

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

