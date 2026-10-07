import { ShoppingCart } from "lucide-react";
import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import ekartLogo from "@/assets/ekart.webp";
import { setUser } from "@/redux/userSlice";
import { authConfig, userApi } from "@/lib/api";

const navLinkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-pink-100 text-pink-700"
      : "text-gray-600 hover:bg-pink-50 hover:text-pink-700"
  }`;

const Navbar = () => {
  const user = useSelector((state) => state.user.user);
  const cartCount = useSelector((state) =>
    state.cart.items.reduce((count, item) => count + item.quantity, 0),
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const clearExpiredSession = () => dispatch(setUser(null));
    window.addEventListener("ekart:session-expired", clearExpiredSession);
    return () => window.removeEventListener("ekart:session-expired", clearExpiredSession);
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      const response = await userApi.post("/logout", {}, authConfig());
      if (response.data.success) toast.success(response.data.message || "Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error(error.response?.data?.message || "Could not log out. Please try again.");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      dispatch(setUser(null));
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-pink-100/80 bg-white/95 shadow-sm shadow-pink-100/40 backdrop-blur-md">
      <div className="mx-auto flex min-h-[72px] max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-8">
        <Link to="/" aria-label="Ekart home" className="flex shrink-0 items-center rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200">
          <img src={ekartLogo} alt="Ekart" className="h-auto w-24 sm:w-28" />
        </Link>

        <nav aria-label="Main navigation" className="order-3 w-full overflow-x-auto pb-1 lg:order-none lg:w-auto lg:pb-0">
          <ul className="flex min-w-max items-center gap-1 rounded-full bg-gray-50 p-1">
            <li><NavLink to="/products" className={navLinkClass}>Products</NavLink></li>
            <li><NavLink to="/orders" className={navLinkClass}>Orders</NavLink></li>
            {user?.role === "admin" && <li><NavLink to="/admin/users" className={navLinkClass}>Users</NavLink></li>}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {user && (
            <Link to="/profile" className="hidden max-w-40 truncate rounded-full border border-gray-100 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-pink-200 hover:bg-pink-50 sm:inline-flex">
              Hi, {user.firstName}
            </Link>
          )}

          <Link to="/cart" aria-label={`Shopping cart, ${cartCount} items`} className="relative inline-flex h-10 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-gray-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-100">
            <ShoppingCart className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="hidden text-sm font-semibold sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-pink-600 px-1 text-[10px] font-bold leading-none text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="inline-flex h-10 items-center rounded-full bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700 sm:hidden">Account</Link>
              <button type="button" onClick={handleLogout} className="inline-flex h-10 items-center justify-center rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700">Log out</button>
            </>
          ) : (
            <Link to="/login" className="inline-flex h-10 items-center justify-center rounded-full bg-pink-600 px-5 text-sm font-semibold text-white shadow-sm shadow-pink-200 transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200">Log in</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
