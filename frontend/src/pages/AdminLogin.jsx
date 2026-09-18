import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://192.168.244.208:5000/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid admin email or password."
        );
      }

      localStorage.setItem(
        "cozyNoorAdmin",
        JSON.stringify({
          email: data.admin.email,
          role: data.admin.role,
          token: data.token,
          isAdmin: true,
        })
      );

      navigate("/admin");
    } catch (error) {
      console.error("Admin login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <p className="admin-login-eyebrow">
          COZY NOOR
        </p>

        <h1>Admin Login</h1>

        <p className="admin-login-subtitle">
          Sign in to manage your Cozy Noor store.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-login-field">
            <label>Email Address</label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter admin email"
              required
            />
          </div>

          <div className="admin-login-field">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <p className="admin-login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Login to Admin"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminLogin;