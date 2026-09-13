import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.fullName,
            email: form.email,
            phone: form.phone,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert("Account created successfully! 🎉");

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      alert(
        error.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-card">
        <div className="register-header">
          <p className="register-eyebrow">JOIN COZY NOOR</p>

          <h1>Create Your Account</h1>

          <p>
            Create an account to manage your orders and enjoy a smoother
            shopping experience.
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-field">
            <label>Full Name *</label>

            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="register-field">
            <label>Email Address *</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="register-field">
            <label>Mobile / WhatsApp Number *</label>

            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter mobile number"
              required
            />
          </div>

          <div className="register-field">
            <label>Password *</label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength="6"
              required
            />
          </div>

          <div className="register-field">
            <label>Confirm Password *</label>

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              minLength="6"
              required
            />
          </div>

          <label className="register-terms">
            <input type="checkbox" required />
            <span>
              I agree to the terms and conditions.
            </span>
          </label>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="register-divider">
          <span>OR</span>
        </div>

        <p className="register-login">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

        <Link to="/shop" className="register-shop-link">
          Continue Shopping
        </Link>
      </section>
    </main>
  );
}

export default Register;