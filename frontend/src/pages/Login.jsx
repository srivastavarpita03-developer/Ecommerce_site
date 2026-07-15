import "./Login.css";
import React, { useState } from "react";
import api from "../utils/api";

function Auth() {
  const [authMode, setAuthMode] = useState("register");
  const [data, setData] = useState({
    name: "",
    contactNumber: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(e) {
    const { value, name } = e.target;
    setData({ ...data, [name]: value });
  }

  function changeMode(mode) {
    setAuthMode(mode);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const url = authMode == "login" ? "/auth/login" : "/auth/register";
    const payload =
      authMode == "login"
        ? {
            email: data.email,
            password: data.password,
          }
        : data;
    const response = await api.post(url, payload);
    console.log(response.data);
    if (response.data?.success) {
      alert(response.data?.message);
    }
  }

  return (
    <main className="container">
      <section className="img-section">
        <img
          src="https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2xvdGhpbmd8ZW58MHx8MHx8fDA%3D"
          className="img-bg"
        />
        <div className="img-caption">
          <h2>The Standard of Excellence</h2>
          <p>
            Experience a curated collection of artisanal craftsmanship and
            timeless silhouettes designed for the modern connoisseur.
          </p>
        </div>
      </section>

      <section className="auth-section">
        <div className="auth-wrapper">
          <div className="tabs-container">
            <button className="tab-btn" onClick={() => changeMode("login")}>
              Login
            </button>
            <button className="tab-btn" onClick={() => changeMode("register")}>
              Create Account
            </button>
          </div>

          <div className="auth-tab">
            {/* Form-header for Register  */}
            <div className="form-header">
              <h1>Join the Elite</h1>
              <p>
                {authMode == "login"
                  ? "Login to your account to make orders and track your orders."
                  : "Create an account to track orders and join our loyalty program."}
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {authMode == "register" && (
                <>
                  <div className="input-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Enter Your Name..."
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="contactNumber">contact number</label>
                    <input
                      type="text"
                      id="contactNumber"
                      name="contactNumber"
                      placeholder="Enter 10 digit contact number"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="address">Address</label>
                    <textarea
                      name="address"
                      id="address"
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </>
              )}
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="dev@gmail.com"
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  name="password"
                  placeholder="At least 8 characters"
                  type="password"
                  onChange={handleChange}
                />
              </div>

              {authMode == "register" && (
                <div className="input-group">
                  <label htmlFor="conf-password">Confirm Password</label>
                  <input
                    id="conf-password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    type="password"
                    onChange={handleChange}
                  />
                </div>
              )}

              <button className="submit-btn">
                {authMode == "register" ? "Create Account" : "Login Account"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Auth;
