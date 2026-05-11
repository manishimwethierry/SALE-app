import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { auth } from "../auth";

const emptyProduct = { name: "", sku: "", price: "", quantity: "" };
const emptySale = { customer: "", product: "", quantity: "" };

function DashboardPage() {
  const navigate = useNavigate();
  const user = auth.getUser();

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [saleForm, setSaleForm] = useState(emptySale);
  const [editingProductId, setEditingProductId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    const totalSales = sales.reduce((sum, item) => sum + item.total, 0);
    return {
      totalSales,
      productCount: products.length,
      customerCount: customers.length,
    };
  }, [sales, products.length, customers.length]);

  const loadData = async () => {
    try {
      setError("");
      const [productRes, customerRes, saleRes] = await Promise.all([
        api.getProducts(),
        api.getCustomers(),
        api.getSales(),
      ]);
      setProducts(productRes);
      setCustomers(customerRes);
      setSales(saleRes);
    } catch (loadError) {
      setError(loadError.message);
      if (loadError.message.toLowerCase().includes("unauthorized")) {
        auth.clearSession();
        navigate("/login");
      }
    }
  };

  const showSuccess = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        quantity: Number(productForm.quantity),
      };
      if (editingProductId) {
        await api.updateProduct(editingProductId, payload);
        showSuccess("Product updated.");
      } else {
        await api.addProduct(payload);
        showSuccess("Product created.");
      }
      setProductForm(emptyProduct);
      setEditingProductId("");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addSale({
        customer: saleForm.customer,
        product: saleForm.product,
        quantity: Number(saleForm.quantity),
      });
      setSaleForm(emptySale);
      showSuccess("Sale recorded and stock updated.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const editProduct = (product) => {
    setProductForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
    });
    setEditingProductId(product._id);
  };

  const removeProduct = async (id) => {
    try {
      await api.deleteProduct(id);
      showSuccess("Product deleted.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name || "Manager"}</p>
      </div>

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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-indigo-600 text-white rounded-2xl p-5 shadow">
          <p className="text-indigo-200 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold mt-1">${totals.totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-emerald-500 text-white rounded-2xl p-5 shadow">
          <p className="text-emerald-100 text-sm">Products</p>
          <p className="text-3xl font-bold mt-1">{totals.productCount}</p>
        </div>
        <div className="bg-amber-500 text-white rounded-2xl p-5 shadow">
          <p className="text-amber-100 text-sm">Customers</p>
          <p className="text-3xl font-bold mt-1">{totals.customerCount}</p>
        </div>
      </div>

      {/* Load Data Button */}
      <div className="mb-6">
        <button
          onClick={loadData}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg transition-colors"
        >
          🔄 Load / Refresh Data
        </button>
      </div>

      {/* Forms Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Product Form */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {editingProductId ? "✏️ Edit Product" : "➕ Add Product"}
          </h2>
          <form onSubmit={handleProductSubmit} className="space-y-3">
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Product name *"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              required
            />
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="SKU *"
              value={productForm.sku}
              onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Price *"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                required
              />
              <input
                type="number"
                min="0"
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Quantity *"
                value={productForm.quantity}
                onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                {editingProductId ? "Update" : "Add Product"}
              </button>
              {editingProductId && (
                <button
                  type="button"
                  onClick={() => { setProductForm(emptyProduct); setEditingProductId(""); }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Sale Form */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">🛒 Record Sale</h2>
          <form onSubmit={handleSaleSubmit} className="space-y-3">
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              value={saleForm.customer}
              onChange={(e) => setSaleForm({ ...saleForm, customer: e.target.value })}
              required
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              value={saleForm.product}
              onChange={(e) => setSaleForm({ ...saleForm, product: e.target.value })}
              required
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (Stock: {p.quantity})
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Quantity sold *"
              value={saleForm.quantity}
              onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
              required
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Save Sale
            </button>
          </form>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">Products</h2>
        </div>
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No products yet. Load data or add one above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">SKU</th>
                <th className="px-6 py-3 text-right">Price</th>
                <th className="px-6 py-3 text-right">Stock</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                  <td className="px-6 py-4 text-gray-500">{item.sku}</td>
                  <td className="px-6 py-4 text-right text-gray-700">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.quantity > 10 ? "bg-green-100 text-green-700" : item.quantity > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => editProduct(item)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-medium px-3 py-1 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeProduct(item._id)}
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
      </div>
    </div>
  );
}

export default DashboardPage;
