import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { auth } from "../auth";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      setError("");
      const result = await api.login(form);
      auth.setSession(result.token, result.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="auth-wrap">
      <div className="card auth-card">
        <h1>Login</h1>
        {error && <p className="message err">{error}</p>}
        <form onSubmit={submit}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p className="auth-link">
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </main>
  );
}

export default LoginPage;
