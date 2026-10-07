import { Link } from "react-router-dom";
import { ArrowRight, PackageCheck, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const Orders = () => (
  <main className="min-h-[75vh] bg-gradient-to-b from-pink-50 via-white to-white px-4 py-10 sm:py-14">
    <div className="mx-auto max-w-5xl">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-600">Your account</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">My orders</h1>
        <p className="mt-2 text-gray-500">View your purchases and follow each delivery from checkout to your door.</p>
      </div>

      <section className="mt-8 overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
        <div className="flex flex-col items-center px-6 py-12 text-center sm:px-10 sm:py-16">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-pink-50 text-pink-600">
            <ShoppingBag className="h-10 w-10" strokeWidth={1.6} aria-hidden="true" />
            <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-pink-500 text-white">
              <PackageCheck className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">No orders yet</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
            When you place an order, you’ll find its details and delivery updates here.
          </p>
          <Button render={<Link to="/products" />} className="mt-6 gap-2 bg-pink-600 px-5 text-white hover:bg-pink-700">
            Explore products <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="grid gap-4 border-t border-gray-100 bg-gray-50/70 px-6 py-6 sm:grid-cols-3 sm:px-10">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="rounded-xl bg-white p-2.5 text-pink-600 shadow-sm"><ShoppingBag className="h-4 w-4" aria-hidden="true" /></span>
            <span>Order details in one place</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="rounded-xl bg-white p-2.5 text-pink-600 shadow-sm"><Truck className="h-4 w-4" aria-hidden="true" /></span>
            <span>Follow delivery updates</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="rounded-xl bg-white p-2.5 text-pink-600 shadow-sm"><PackageCheck className="h-4 w-4" aria-hidden="true" /></span>
            <span>Review past purchases</span>
          </div>
        </div>
      </section>
    </div>
  </main>
);

export default Orders;
