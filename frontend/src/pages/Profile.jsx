import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
  });

  async function getProfile() {
    try {
      setLoading(true);

      const response = await api.get("/auth/me");

      if (response.data.success) {
        const data = response.data.data;

        setUser(data);

        setFormData({
          name: data.name || "",
          email: data.email || "",
          contactNumber: data.contactNumber || "",
          address: data.address || "",
        });
      }
    } catch (error) {
      console.log("Profile Error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 400
      ) {
        alert("Please login first");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProfile();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (!formData.contactNumber) {
      alert("Please enter contact number");
      return;
    }

    if (!formData.address.trim()) {
      alert("Please enter address");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        "/auth/profile",
        formData
      );

      if (response.data.success) {
        alert("Profile Updated Successfully");

        setUser(response.data.data);

        setEditing(false);
      }
    } catch (error) {
      console.log("Update Profile Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      const response = await api.post("/auth/logout");

      if (response.data.success) {
        alert("Logout Successfully");
        navigate("/login");
      }
    } catch (error) {
      console.log("Logout Error:", error);
    }
  }

  if (loading) {
    return (
      <section className="profilePage">
        <div className="profileLoading">
          Loading Profile...
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="profilePage">
        <div className="profileError">
          <h2>Profile Not Found</h2>

          <button onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="profilePage">
      <div className="profileContainer">

        <div className="profileHeader">
          <div>
            <h1>My Profile</h1>
            <p>Manage your account information</p>
          </div>

          <div className="profileIcon">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {editing ? (
          <form
            className="profileCard"
            onSubmit={handleUpdateProfile}
          >
            <h2>Edit Profile</h2>

            <div className="profileFormGroup">
              <label>Name</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="profileFormGroup">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="profileFormGroup">
              <label>Contact Number</label>

              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </div>

            <div className="profileFormGroup">
              <label>Address</label>

              <textarea
                rows="4"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="profileActions">
              <button
                type="submit"
                className="saveBtn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <button
                type="button"
                className="cancelBtn"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profileCard">

            <h2>Personal Information</h2>

            <div className="profileInfoGrid">

              <div className="profileInfo">
                <span>Name</span>
                <strong>{user.name}</strong>
              </div>

              <div className="profileInfo">
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>

              <div className="profileInfo">
                <span>Contact Number</span>
                <strong>
                  {user.contactNumber || "Not Available"}
                </strong>
              </div>

              <div className="profileInfo">
                <span>Address</span>
                <strong>
                  {user.address || "Not Available"}
                </strong>
              </div>

            </div>

            <div className="profileActions">

              <button
                className="editBtn"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>

              <button
                className="ordersBtn"
                onClick={() => navigate("/orders")}
              >
                My Orders
              </button>

              <button
                className="logoutProfileBtn"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}

export default Profile;