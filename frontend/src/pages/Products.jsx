import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowUpDown, Minus, Plus, RefreshCw, Search, ShoppingCart, SlidersHorizontal, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { addToCart, decreaseQuantity } from "@/redux/cartSlice";

const API_URL = "https://dummyjson.com/products";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const quantity = useSelector((state) =>
    state.cart.items.find((item) => item.id === product.id)?.quantity ?? 0,
  );

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    toast.success(`${product.title} added to cart`);
  };

  return (
  <article className="group flex h-[500px] w-full max-w-[200px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100/70">
    <div className="relative flex h-60 items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50/70 via-white to-rose-50 p-6">
      {product.discountPercentage > 0 && (
        <span className="absolute left-4 top-4 rounded-full bg-pink-600 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
          Save {Math.round(product.discountPercentage)}%
        </span>
      )}
      <img
        src={product.thumbnail || product.images?.[0]}
        alt={product.title}
        loading="lazy"
        className="h-full w-full object-contain drop-shadow-sm transition duration-500 group-hover:scale-110"
      />
    </div>
    <div className="flex flex-1 flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-pink-600">
          {product.category?.replaceAll("-", " ")}
        </p>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
          <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> {product.rating?.toFixed(1) ?? "—"}
        </span>
      </div>
      <h2 className="mt-2 line-clamp-1 text-base font-bold text-gray-900" title={product.title}>{product.title}</h2>
      <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">{product.description}</p>
      <div className="mt-auto pt-5">
        <div className="flex items-end justify-between gap-2 border-t border-gray-100 pt-4">
          <div>
            <span className="block text-xl font-extrabold tracking-tight text-gray-900">{formatPrice(product.price)}</span>
            {product.discountPercentage > 0 && (
              <span className="mt-0.5 block text-xs text-gray-400 line-through">
                {formatPrice(product.price / (1 - product.discountPercentage / 100))}
              </span>
            )}
          </div>
          <span className={`mb-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${product.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
            {product.stock > 0 ? "In stock" : "Sold out"}
          </span>
        </div>
        <p className="mt-3 text-[11px] text-gray-400">{product.brand || "Ekart pick"}</p>
        {quantity > 0 ? (
          <div className="mt-3 flex h-9 w-full items-center justify-between rounded-xl bg-pink-600 px-2 text-white">
            <button type="button" onClick={() => dispatch(decreaseQuantity(product.id))} aria-label={`Remove one ${product.title}`} className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-pink-700">
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="text-sm font-bold" aria-live="polite">{quantity}</span>
            <button type="button" onClick={handleAddToCart} disabled={quantity >= product.stock} aria-label={`Add one ${product.title}`} className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-40">
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={handleAddToCart} disabled={product.stock <= 0} className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-3 text-xs font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Add to cart
          </button>
        )}
      </div>
    </div>
  </article>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetch(`${API_URL}?limit=0`, { signal: controller.signal }),
          fetch(`${API_URL}/category-list`, { signal: controller.signal }),
        ]);

        if (!productResponse.ok || !categoryResponse.ok) {
          throw new Error("The product service returned an error. Please try again.");
        }

        const [productData, categoryData] = await Promise.all([
          productResponse.json(),
          categoryResponse.json(),
        ]);
        setProducts(Array.isArray(productData.products) ? productData.products : []);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message || "Could not load products. Check your connection and try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadProducts();
    return () => controller.abort();
  }, [retry]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesSearch = !query || [product.title, product.description, product.brand, product.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });

    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    if (sort === "rating") result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return result;
  }, [products, search, category, sort]);

  return (
    <main className="min-h-[75vh] bg-gradient-to-b from-pink-50 via-white to-white px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-600">The Ekart collection</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Find your next favorite</h1>
            <p className="mt-2 text-gray-500">Browse the latest picks across our collection.</p>
          </div>
          {!loading && !error && (
            <p className="rounded-full border border-pink-100 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm">
              <span className="text-pink-600">{visibleProducts.length}</span> products
            </p>
          )}
        </div>

        <section aria-label="Product filters" className="mb-9 rounded-3xl border border-pink-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_230px]">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Search the collection</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-500" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Try ‘shoes’, ‘watch’ or a brand"
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50/70 pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Sort by</span>
              <span className="relative block">
                <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-500" aria-hidden="true" />
                <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-12 w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50/70 pl-11 pr-4 text-sm font-medium text-gray-700 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100">
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="rating">Top rated</option>
                </select>
              </span>
            </label>
          </div>
          <div className="mt-5 border-t border-gray-100 pt-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <SlidersHorizontal className="h-3.5 w-3.5 text-pink-500" aria-hidden="true" /> Browse categories
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
              <button type="button" onClick={() => setCategory("all")} aria-pressed={category === "all"} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${category === "all" ? "bg-pink-600 text-white shadow-sm shadow-pink-200" : "border border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"}`}>
                All products
              </button>
              {categories.map((item) => (
                <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${category === item ? "bg-pink-600 text-white shadow-sm shadow-pink-200" : "border border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"}`}>
                  {item.replaceAll("-", " ")}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="grid justify-items-center gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5" aria-label="Loading products">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="h-[500px] w-full max-w-[200px] animate-pulse overflow-hidden rounded-3xl border border-gray-100 bg-white">
                <div className="h-60 bg-gray-100" />
                <div className="space-y-3 p-5"><div className="h-3 w-1/3 rounded bg-gray-100" /><div className="h-5 w-3/4 rounded bg-gray-100" /><div className="h-4 w-full rounded bg-gray-100" /></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm">
            <AlertCircle className="h-10 w-10 text-red-500" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Products couldn’t load</h2>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-pink-600 px-4 text-sm font-semibold text-white transition hover:bg-pink-700">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
            </button>
          </div>
        ) : visibleProducts.length ? (
          <div className="grid justify-items-center gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-pink-200 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-gray-900">No matching products</h2>
            <p className="mt-2 text-sm text-gray-500">Try a different search or category.</p>
            <button type="button" onClick={() => { setSearch(""); setCategory("all"); }} className="mt-4 rounded-full bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-700 transition hover:bg-pink-100">Clear filters</button>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">Prices and inventory are sample data provided by DummyJSON.</p>
      </div>
    </main>
  );
};

export default Products;
