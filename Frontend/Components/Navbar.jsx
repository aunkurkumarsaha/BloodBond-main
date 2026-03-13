import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, HeartPulse, LogOut, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const type = localStorage.getItem("userType");
      const name = localStorage.getItem("userName");
      setIsLoggedIn(!!token);
      setUserType(type);
      setUserName(name || "");
    };

    checkAuth();
    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener("storage", checkAuth);
    // Custom event for same-tab updates
    window.addEventListener("authChange", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setUserType(null);
    setUserName("");
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
  };

  const dashboardPath = userType === "hospital" ? "/hospital-dashboard" : "/user-dashboard";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-lg shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center text-white text-2xl font-bold">
          <HeartPulse className="mr-2 text-[#fb4673]" />
          <span className="text-[#28bca9]">BloodBond</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <NavItem to="/" label="Home" />
          <NavItem to="/about" label="About" />
          <NavItem to="/contact" label="Contact" />
          <NavItem to="/events" label="Events" />

          {isLoggedIn ? (
            <div className="flex items-center space-x-4 ml-4">
              <Link
                to={dashboardPath}
                className="flex items-center gap-2 bg-[#28bca9] text-white px-4 py-2 rounded-lg hover:bg-[#1fa392] transition"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-[#fb4673] text-white px-4 py-2 rounded-lg hover:bg-[#d13b62] transition cursor-pointer"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3 ml-4">
              <Link
                to="/login"
                className="bg-[#fb4673] text-white px-4 py-2 rounded-lg hover:bg-[#d13b62] transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="border border-[#28bca9] text-[#28bca9] px-4 py-2 rounded-lg hover:bg-[#28bca9] hover:text-white transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white/10 backdrop-blur-lg text-white flex flex-col items-center space-y-4 py-4"
        >
          <NavItem to="/" label="Home" />
          <NavItem to="/about" label="About" />
          <NavItem to="/contact" label="Contact" />
          <NavItem to="/events" label="Events" />

          {isLoggedIn ? (
            <>
              <Link
                to={dashboardPath}
                className="flex items-center gap-2 bg-[#28bca9] text-white px-4 py-2 rounded-lg"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-[#fb4673] text-white px-4 py-2 rounded-lg cursor-pointer"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-[#fb4673] text-white px-4 py-2 rounded-lg">
                Login
              </Link>
              <Link to="/signup" className="border border-[#28bca9] text-[#28bca9] px-4 py-2 rounded-lg">
                Sign Up
              </Link>
            </>
          )}
        </motion.div>
      )}
    </nav>
  );
};

const NavItem = ({ to, label }) => (
  <Link
    to={to}
    className="text-[#fc4848] text-lg font-semibold hover:text-[#d13636] transition duration-300"
  >
    {label}
  </Link>
);

export default Navbar;