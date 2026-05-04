import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { auth } from "../auth";
import "../App.css";

const emptyProduct = { name: "", sku: "", price: "", quantity: "" };
const emptyCustomer = { name: "", email: "", phone: "" };
const emptySale = { customer: "", product: "", quantity: "" };

function DashboardPage() {
  const navigate = useNavigate();
  const user = auth.getUser();

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [saleForm, setSaleForm] = useState(emptySale);
  const [editingProductId, setEditingProductId] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState("");
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

  useEffect(() => {
    loadData();
  }, []);

  const showSuccess = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const logout = () => {
    auth.clearSession();
    navigate("/login");
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
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
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const handleCustomerSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingCustomerId) {
        await api.updateCustomer(editingCustomerId, customerForm);
        showSuccess("Customer updated.");
      } else {
        await api.addCustomer(customerForm);
        showSuccess("Customer created.");
      }
      setCustomerForm(emptyCustomer);
      setEditingCustomerId("");
      await loadData();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const handleSaleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.addSale({
        customer: saleForm.customer,
        product: saleForm.product,
        quantity: Number(saleForm.quantity),
      });
      setSaleForm(emptySale);
      showSuccess("Sale recorded and stock updated.");
      await loadData();
    } catch (submitError) {
      setError(submitError.message);
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

  const editCustomer = (customer) => {
    setCustomerForm({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
    });
    setEditingCustomerId(customer._id);
  };

  const removeProduct = async (id) => {
    try {
      await api.deleteProduct(id);
      showSuccess("Product deleted.");
      await loadData();
    } catch (removeError) {
      setError(removeError.message);
    }
  };

  const removeCustomer = async (id) => {
    try {
      await api.deleteCustomer(id);
      showSuccess("Customer deleted.");
      await loadData();
    } catch (removeError) {
      setError(removeError.message);
    }
  };

  return (
    <main className="container">
      <div className="top-bar">
        <div>
          <h1>Sales Management Dashboard</h1>
          <p className="subtitle">Welcome, {user?.name || "Manager"}</p>
        </div>
        <div className="top-links">
          <Link to="/dashboard">Dashboard</Link>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <section className="stats">
        <div>Total Sales: ${totals.totalSales.toFixed(2)}</div>
        <div>Products: {totals.productCount}</div>
        <div>Customers: {totals.customerCount}</div>
      </section>

      {message && <p className="message ok">{message}</p>}
      {error && <p className="message err">{error}</p>}

      <section className="grid">
        <article className="card">
          <h2>{editingProductId ? "Edit Product" : "Product Registration"}</h2>
          <form onSubmit={handleProductSubmit}>
            <input
              placeholder="Product name"
              value={productForm.name}
              onChange={(e) =>
                setProductForm({ ...productForm, name: e.target.value })
              }
              required
            />
            <input
              placeholder="SKU"
              value={productForm.sku}
              onChange={(e) =>
                setProductForm({ ...productForm, sku: e.target.value })
              }
              required
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              value={productForm.price}
              onChange={(e) =>
                setProductForm({ ...productForm, price: e.target.value })
              }
              required
            />
            <input
              type="number"
              min="0"
              placeholder="Quantity"
              value={productForm.quantity}
              onChange={(e) =>
                setProductForm({ ...productForm, quantity: e.target.value })
              }
              required
            />
            <button type="submit">
              {editingProductId ? "Update Product" : "Create Product"}
            </button>
          </form>
        </article>

        <article className="card">
          <h2>{editingCustomerId ? "Edit Customer" : "Customer Registration"}</h2>
          <form onSubmit={handleCustomerSubmit}>
            <input
              placeholder="Customer name"
              value={customerForm.name}
              onChange={(e) =>
                setCustomerForm({ ...customerForm, name: e.target.value })
              }
              required
            />
            <input
              placeholder="Email"
              value={customerForm.email}
              onChange={(e) =>
                setCustomerForm({ ...customerForm, email: e.target.value })
              }
            />
            <input
              placeholder="Phone"
              value={customerForm.phone}
              onChange={(e) =>
                setCustomerForm({ ...customerForm, phone: e.target.value })
              }
            />
            <button type="submit">
              {editingCustomerId ? "Update Customer" : "Create Customer"}
            </button>
          </form>
        </article>

        <article className="card">
          <h2>Record Daily Sale</h2>
          <form onSubmit={handleSaleSubmit}>
            <select
              value={saleForm.customer}
              onChange={(e) =>
                setSaleForm({ ...saleForm, customer: e.target.value })
              }
              required
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <select
              value={saleForm.product}
              onChange={(e) =>
                setSaleForm({ ...saleForm, product: e.target.value })
              }
              required
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} (Stock: {product.quantity})
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              placeholder="Sold quantity"
              value={saleForm.quantity}
              onChange={(e) =>
                setSaleForm({ ...saleForm, quantity: e.target.value })
              }
              required
            />
            <button type="submit">Save Sale</button>
          </form>
        </article>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Products</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <button onClick={() => editProduct(item)}>Edit</button>
                    <button onClick={() => removeProduct(item._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card">
          <h2>Customers</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.phone}</td>
                  <td>
                    <button onClick={() => editCustomer(item)}>Edit</button>
                    <button onClick={() => removeCustomer(item._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card">
          <h2>Daily Sales</h2>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((item) => (
                <tr key={item._id}>
                  <td>{item.customer?.name}</td>
                  <td>{item.product?.name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </main>
  );
}

export default DashboardPage;
