import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { addToCart, decreaseQuantity } from "@/redux/cartSlice";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    toast.success(`${product.title} added to cart`);
  };

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://dummyjson.com/products?limit=5&sortBy=rating&order=desc", {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load featured products");
        return response.json();
      })
      .then((data) => setProducts(Array.isArray(data.products) ? data.products : []))
      .catch((error) => {
        if (error.name !== "AbortError") setProducts([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <section id="featured" className="scroll-mt-24 bg-gradient-to-b from-white to-pink-50/60 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-600">Picked for you</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Featured products</h2>
            <p className="mt-2 text-gray-500">A few customer favorites to get you started.</p>
          </div>
          <Link to="/products" className="inline-flex w-fit items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2.5 text-sm font-semibold text-pink-700 shadow-sm transition hover:border-pink-300 hover:bg-pink-50">
            View all products <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5" aria-label="Loading featured products">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="h-48 bg-gray-100" />
                <div className="space-y-3 p-4"><div className="h-3 w-1/3 rounded bg-gray-100" /><div className="h-5 w-3/4 rounded bg-gray-100" /><div className="h-4 w-1/2 rounded bg-gray-100" /></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {products.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-lg">
                <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-pink-50 to-white p-5">
                  {product.discountPercentage > 0 && <span className="absolute left-3 top-3 rounded-full bg-pink-600 px-2.5 py-1 text-[11px] font-bold text-white">{Math.round(product.discountPercentage)}% off</span>}
                  <img src={product.thumbnail || product.images?.[0]} alt={product.title} loading="lazy" className="h-full w-full object-contain transition duration-300 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <p className="truncate text-[11px] font-bold uppercase tracking-wider text-pink-600">{product.category?.replaceAll("-", " ")}</p>
                  <h3 className="mt-1 line-clamp-1 font-semibold text-gray-900" title={product.title}>{product.title}</h3>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="font-bold text-gray-900">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.price)}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"><Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />{product.rating?.toFixed(1)}</span>
                  </div>
                  {(() => {
                    const quantity = cartItems.find((item) => item.id === product.id)?.quantity ?? 0;
                    return quantity > 0 ? (
                      <div className="mt-4 flex h-9 w-full items-center justify-between rounded-xl bg-pink-600 px-2 text-white">
                        <button type="button" onClick={() => dispatch(decreaseQuantity(product.id))} aria-label={`Remove one ${product.title}`} className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-pink-700">
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="text-sm font-bold" aria-live="polite">{quantity}</span>
                        <button type="button" onClick={() => handleAddToCart(product)} disabled={quantity >= product.stock} aria-label={`Add one ${product.title}`} className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-40">
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => handleAddToCart(product)} disabled={product.stock <= 0} className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-3 text-xs font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300">
                        <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Add to cart
                      </button>
                    );
                  })()}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-pink-100 bg-white px-5 py-8 text-center text-sm text-gray-500">Featured products are temporarily unavailable. Browse the catalog to see all products.</p>
        )}
        <p className="mt-5 text-center text-xs text-gray-400">Sample product data provided by DummyJSON.</p>
      </div>
    </section>
  );
};

export default FeaturedProducts;
