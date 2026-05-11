import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { auth } from "../auth";

const emptyForm = { name: "", email: "", phone: "" };

function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCustomers = async () => {
    try {
      setError("");
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
      if (err.message.toLowerCase().includes("unauthorized")) {
        auth.clearSession();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const showSuccess = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      if (editingId) {
        await api.updateCustomer(editingId, form);
        showSuccess("Customer updated successfully.");
      } else {
        await api.addCustomer(form);
        showSuccess("Customer added successfully.");
      }
      setForm(emptyForm);
      setEditingId("");
      await loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (customer) => {
    setForm({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
    });
    setEditingId(customer._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await api.deleteCustomer(id);
      showSuccess("Customer deleted.");
      await loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Customers</h1>

      {/* Feedback */}
      {message && (
        <div className="mb-4 px-4 py-3 bg-green-100 border border-green-400 text-green-800 rounded-lg">
          ✅ {message}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-100 border border-red-400 text-red-800 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          {editingId ? "✏️ Edit Customer" : "➕ Add New Customer"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Full name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <div className="sm:col-span-3 flex gap-3">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              {editingId ? "Update Customer" : "Add Customer"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          className="w-full sm:w-80 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="🔍 Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {search ? "No customers match your search." : "No customers yet. Add one above!"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-indigo-50 text-indigo-700 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((customer, idx) => (
                <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-400">{idx + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{customer.name}</td>
                  <td className="px-6 py-4 text-gray-600">{customer.email || "—"}</td>
                  <td className="px-6 py-4 text-gray-600">{customer.phone || "—"}</td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => startEdit(customer)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-medium px-3 py-1 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer._id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium px-3 py-1 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500 border-t">
            Showing {filtered.length} of {customers.length} customer{customers.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomersPage;
