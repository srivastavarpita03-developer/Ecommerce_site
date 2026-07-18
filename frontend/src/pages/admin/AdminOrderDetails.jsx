import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import "./AdminOrderDetails.css";

function AdminOrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);

    useEffect(() => {
        getOrder();
    }, [id]);

    async function getOrder() {
        try {
            const response = await api.get(`/orders/${id}`);

            if (response.data.success) {
                setOrder(response.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    if (!order) {
        return <h2>Loading...</h2>;
    }
    const IMAGE_API = "http://localhost:4000/uploads/"
    return (
        <section className="adminOrderDetails">
            <div className="orderDetailsHeader">
                <h2>Order Details</h2>

                <button className="backBtn" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>

            <div className="detailsCard">
                <h3>Customer Details</h3>

                <div className="detailRow">
                    <div className="detailItem">
                        <label>Order ID</label>
                        <p>{order._id}</p>
                    </div>

                    <div className="detailItem">
                        <label>Customer Name</label>
                        <p>{order.userId?.name}</p>
                    </div>
                </div>

                <div className="detailRow">
                    <div className="detailItem">
                        <label>Email</label>
                        <p>{order.userId?.email}</p>
                    </div>

                    <div className="detailItem">
                        <label>Phone</label>
                        <p>{order.userId?.contactNumber || "N/A"}</p>
                    </div>
                </div>

                <div className="detailRow">
                    <div className="detailItem">
                        <label>Shipping Address</label>
                        <p>{order.shippingAddress}</p>
                    </div>
                </div>

                <div className="detailRow">
                    <div className="detailItem">
                        <label>Total Amount</label>
                        <p>₹ {order.totalOrderValue}</p>
                    </div>

                    <div className="detailItem">
                        <label>Payment Mode</label>
                        <p>{order.payementMode}</p>
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
                            {order.paymentStatus}
                        </p>
                    </div>

                    <div className="detailItem">
                        <label>Order Status</label>

                        <span className={`status ${order.orderStatus}`}>
                            {order.orderStatus}
                        </span>
                    </div>
                </div>
            </div>

            <div className="detailsCard">
                <h3>Ordered Products</h3>

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
                        {order.items?.map((item) => (
                            <tr key={item._id}>
                                <td>
                                    <img
                                        src={IMAGE_API + item.productId?.images[0]}
                                        alt={item.productId?.name}
                                        className="productImage"
                                    />
                                </td>

                                <td>{item.productId?.name}</td>

                                <td>₹ {item.productId?.price}</td>

                                <td>{item.quantity}</td>

                                <td>₹ {item.productId?.price * item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default AdminOrderDetails;