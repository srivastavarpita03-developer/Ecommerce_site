import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../utils/api";
import "./AdminTickets.css";

function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadTickets() {
    try {
      setLoading(true);
      const response = await api.get("/support-tickets");
      setTickets(response.data.data || []);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Unable to load tickets", text: error.response?.data?.message || "Please try again." });
    } finally { setLoading(false); }
  }

  useEffect(() => { loadTickets(); }, []);

  async function updateTicket(ticket, status) {
    const { value: adminNote } = await Swal.fire({ title: `${status} ticket`, input: "textarea", inputLabel: "Admin note (optional)", showCancelButton: true, confirmButtonText: "Save" });
    if (adminNote === undefined) return;
    try {
      const response = await api.put(`/support-tickets/${ticket._id}`, { status, adminNote });
      await Swal.fire({ icon: "success", title: "Ticket updated", text: response.data.message });
      loadTickets();
    } catch (error) { Swal.fire({ icon: "error", title: "Update failed", text: error.response?.data?.message || "Please try again." }); }
  }

  return <section className="adminTickets">
    <div className="ticketsHeader"><div><h1>Support Tickets</h1><p>Track cancellation, return, and refund requests by ticket ID.</p></div><button onClick={loadTickets}>Refresh</button></div>
    {loading ? <div className="ticketPanel">Loading tickets...</div> : tickets.length === 0 ? <div className="ticketPanel">No support tickets yet.</div> : <div className="ticketPanel ticketTableWrap"><table><thead><tr><th>Ticket</th><th>Customer</th><th>Request</th><th>Order</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead><tbody>{tickets.map((ticket) => <tr key={ticket._id}><td><strong>{ticket.ticketId}</strong><small>{new Date(ticket.createdAt).toLocaleDateString()}</small></td><td>{ticket.userId?.name || "Customer"}<small>{ticket.userId?.email}</small></td><td className="ticketType">{ticket.type}</td><td>#{ticket.orderId?._id?.slice(-8)}<small>{ticket.orderId?.paymentStatus}</small></td><td className="ticketReason">{ticket.reason}</td><td><span className={`ticketStatus ${ticket.status}`}>{ticket.status}</span></td><td>{ticket.status === "open" ? <div className="ticketActions"><button onClick={() => updateTicket(ticket, "approved")}>Approve</button><button className="reject" onClick={() => updateTicket(ticket, "rejected")}>Reject</button></div> : <button className="resolve" onClick={() => updateTicket(ticket, "resolved")}>Resolve</button>}</td></tr>)}</tbody></table></div>}
  </section>;
}

export default AdminTickets;
