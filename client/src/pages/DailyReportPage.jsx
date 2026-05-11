import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { auth } from "../auth";

function DailyReportPage() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const loadSales = async () => {
    try {
      setError("");
      const data = await api.getSales();
      setSales(data);
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
    loadSales();
  }, []);

  // Filter by selected date
  const filtered = sales.filter((sale) => {
    if (!dateFilter) return true;
    const saleDate = new Date(sale.createdAt || sale.date).toISOString().slice(0, 10);
    return saleDate === dateFilter;
  });

  const totalRevenue = filtered.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalQty = filtered.reduce((sum, s) => sum + (s.quantity || 0), 0);

  // Group by customer for summary
  const byCustomer = filtered.reduce((acc, sale) => {
    const name = sale.customer?.name || "Unknown";
    if (!acc[name]) acc[name] = { total: 0, qty: 0, count: 0 };
    acc[name].total += sale.total || 0;
    acc[name].qty += sale.quantity || 0;
    acc[name].count += 1;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Daily Report</h1>
      <p className="text-gray-500 mb-6">Overview of all recorded sales</p>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-100 border border-red-400 text-red-800 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* Date filter + refresh */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Filter by date</label>
          <input
            type="date"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            className="mt-5 text-sm text-indigo-600 hover:underline"
          >
            Clear filter
          </button>
        )}
        <button
          onClick={loadSales}
          className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-indigo-600 text-white rounded-2xl p-5 shadow">
          <p className="text-indigo-200 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold mt-1">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-emerald-500 text-white rounded-2xl p-5 shadow">
          <p className="text-emerald-100 text-sm">Total Items Sold</p>
          <p className="text-3xl font-bold mt-1">{totalQty}</p>
        </div>
        <div className="bg-amber-500 text-white rounded-2xl p-5 shadow">
          <p className="text-amber-100 text-sm">Number of Transactions</p>
          <p className="text-3xl font-bold mt-1">{filtered.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700">Sales Transactions</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading sales...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {dateFilter ? "No sales on this date." : "No sales recorded yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">#</th>
                    <th className="px-5 py-3 text-left">Customer</th>
                    <th className="px-5 py-3 text-left">Product</th>
                    <th className="px-5 py-3 text-right">Qty</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((sale, idx) => (
                    <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-400">{idx + 1}</td>
                      <td className="px-5 py-3 font-medium text-gray-800">
                        {sale.customer?.name || "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {sale.product?.name || "—"}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-700">{sale.quantity}</td>
                      <td className="px-5 py-3 text-right font-semibold text-indigo-700">
                        ${(sale.total || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {sale.createdAt
                          ? new Date(sale.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer Summary */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700">By Customer</h2>
          </div>
          {Object.keys(byCustomer).length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No data</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {Object.entries(byCustomer)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([name, stats]) => (
                  <li key={name} className="px-6 py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{name}</p>
                        <p className="text-xs text-gray-400">
                          {stats.count} transaction{stats.count !== 1 ? "s" : ""} · {stats.qty} items
                        </p>
                      </div>
                      <span className="text-indigo-700 font-semibold text-sm">
                        ${stats.total.toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default DailyReportPage;
