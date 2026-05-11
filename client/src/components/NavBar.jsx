import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../auth";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.getUser();
  const isLoggedIn = !!auth.getToken();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    auth.clearSession();
    navigate("/login");
  };

  const navLinks = [
    { to: "/customers", label: "Customers" },
    { to: "/daily-report", label: "Daily Report" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-white text-2xl font-bold tracking-wide">
                📊 SalesApp
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive(link.to)
                      ? "bg-indigo-900 text-white"
                      : "text-indigo-100 hover:bg-indigo-600 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side: user + login/logout */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="text-indigo-200 text-sm">
                  👤 {user?.name || "User"}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors duration-150"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-medium px-4 py-2 rounded-md transition-colors duration-150"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-indigo-100 hover:text-white focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-indigo-800 px-4 pb-4 pt-2 space-y-1">
          {isLoggedIn &&
            navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.to)
                    ? "bg-indigo-900 text-white"
                    : "text-indigo-100 hover:bg-indigo-600 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          <div className="pt-2 border-t border-indigo-600">
            {isLoggedIn ? (
              <>
                <p className="text-indigo-300 text-xs px-3 pb-1">
                  Signed in as {user?.name}
                </p>
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-300 hover:bg-indigo-600 hover:text-white"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-indigo-100 hover:bg-indigo-600 hover:text-white"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
