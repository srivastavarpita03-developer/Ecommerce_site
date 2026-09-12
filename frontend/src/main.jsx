import { createRoot } from "react-dom/client";
import "./index.css";
import "./style_vars.css";
import Swal from "sweetalert2";
import App from "./App.jsx";
import UserContext from "./context/UserContext.jsx";

// Existing screens use alert(). Route every one through SweetAlert2 while
// individual flows can still use their own success/error styling when needed.
window.alert = (message) => {
  void Swal.fire({
    icon: "info",
    title: "VestiQ",
    text: String(message),
    confirmButtonText: "OK",
  });
};

createRoot(document.getElementById("root")).render(
  <UserContext>
    <App />
  </UserContext>,
);
