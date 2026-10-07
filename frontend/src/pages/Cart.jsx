import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ArrowRight, Minus, PackageSearch, Plus, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearCart, decreaseQuantity, increaseQuantity, removeFromCart } from "@/redux/cartSlice";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

const Cart = () => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-[75vh] bg-gradient-to-b from-pink-50 via-white to-white px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-600">Your bag</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping cart</h1>
          <p className="mt-2 text-gray-500">{itemCount} {itemCount === 1 ? "item" : "items"} ready for you.</p>
        </div>

        {items.length === 0 ? (
          <section className="overflow-hidden rounded-[2rem] border border-pink-100 bg-white shadow-sm">
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-pink-600 via-rose-500 to-fuchsia-500 px-6 py-12 text-white sm:px-12 sm:py-16">
              <div className="absolute -right-16 -top-24 -z-10 h-80 w-80 rounded-full border-[36px] border-white/10" />
              <div className="absolute -bottom-28 right-1/4 -z-10 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
              <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/30 bg-white/15 shadow-xl shadow-pink-900/10 backdrop-blur-sm">
                  <ShoppingBag className="h-12 w-12" strokeWidth={1.5} aria-hidden="true" />
                  <span className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-pink-600 shadow-lg">
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-pink-100">A little room for something lovely</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Your cart is waiting to be filled</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-pink-50 sm:text-base">
                  Explore the collection, find your next favorite, and it’ll be right here when you’re ready.
                </p>
                <Button render={<Link to="/products" />} className="mt-7 h-12 gap-2 rounded-xl bg-white px-6 font-bold text-pink-700 shadow-lg shadow-pink-900/10 transition hover:bg-pink-50">
                  Explore products <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-8 sm:py-6">
              <div className="flex items-center gap-4 rounded-2xl bg-pink-50/70 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-pink-600 shadow-sm"><PackageSearch className="h-5 w-5" aria-hidden="true" /></span>
                <div><p className="font-semibold text-gray-900">Need some inspiration?</p><Link to="/products" className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-pink-700 hover:text-pink-800">Browse the catalog <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm"><ShoppingBag className="h-5 w-5" aria-hidden="true" /></span>
                <div><p className="font-semibold text-gray-900">Your cart stays saved</p><p className="mt-0.5 text-sm text-gray-500">Items remain here on this device.</p></div>
              </div>
            </div>
          </section>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
                <h2 className="font-semibold text-gray-900">Cart items</h2>
                <button type="button" onClick={() => dispatch(clearCart())} className="text-sm font-medium text-gray-500 transition hover:text-red-600">Clear cart</button>
              </div>
              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:px-6">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-50 to-gray-50 p-3">
                        {item.thumbnail ? <img src={item.thumbnail} alt={item.title} className="h-full w-full object-contain" /> : <ShoppingBag className="h-8 w-8 text-pink-300" aria-hidden="true" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">{item.title}</p>
                        <p className="mt-1 text-sm text-gray-500">{item.brand || "Ekart pick"}</p>
                        <p className="mt-2 font-bold text-pink-700">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white">
                        <button type="button" onClick={() => dispatch(decreaseQuantity(item.id))} aria-label={`Decrease ${item.title} quantity`} className="flex h-9 w-9 items-center justify-center rounded-l-xl text-gray-600 transition hover:bg-pink-50 hover:text-pink-700"><Minus className="h-4 w-4" aria-hidden="true" /></button>
                        <span className="w-9 text-center text-sm font-semibold text-gray-900" aria-live="polite">{item.quantity}</span>
                        <button type="button" onClick={() => dispatch(increaseQuantity(item.id))} disabled={item.quantity >= item.stock} aria-label={`Increase ${item.title} quantity`} className="flex h-9 w-9 items-center justify-center rounded-r-xl text-gray-600 transition hover:bg-pink-50 hover:text-pink-700 disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-4 w-4" aria-hidden="true" /></button>
                      </div>
                      <p className="w-24 text-right font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      <button type="button" onClick={() => dispatch(removeFromCart(item.id))} aria-label={`Remove ${item.title} from cart`} className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
                <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-pink-700 hover:text-pink-800"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Continue shopping</Link>
              </div>
            </section>

            <aside className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">Order summary</h2>
              <div className="mt-5 space-y-3 border-b border-gray-100 pb-5 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>Calculated at checkout</span></div>
              </div>
              <div className="flex justify-between py-5 text-base font-bold text-gray-900"><span>Estimated total</span><span>{formatPrice(subtotal)}</span></div>
              <Button type="button" disabled className="h-11 w-full cursor-not-allowed bg-pink-600 text-white opacity-60">Checkout coming soon</Button>
              <p className="mt-3 text-center text-xs leading-5 text-gray-400">Prices are sample USD data. Checkout isn’t available yet.</p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;
