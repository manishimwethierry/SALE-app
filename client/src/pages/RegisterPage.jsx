import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { auth } from "../auth";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      setError("");
      const result = await api.register(form);
      auth.setSession(result.token, result.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="auth-wrap">
      <div className="card auth-card">
        <h1>Register</h1>
        {error && <p className="message err">{error}</p>}
        <form onSubmit={submit}>
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={6}
            required
          />
          <button type="submit">Create Account</button>
        </form>
        <p className="auth-link">
          Already have account? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}

export default RegisterPage;
