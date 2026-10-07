import { Search, ShoppingBag, SlidersHorizontal } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Find your favorites",
    description: "Search across the full collection in seconds.",
    iconClass: "bg-pink-100 text-pink-700",
  },
  {
    icon: SlidersHorizontal,
    title: "Make it yours",
    description: "Filter by category and sort to match your style.",
    iconClass: "bg-violet-100 text-violet-700",
  },
  {
    icon: ShoppingBag,
    title: "Pick up anytime",
    description: "Your cart stays saved on this device.",
    iconClass: "bg-rose-100 text-rose-700",
  },
];

const Features = () => (
  <section className="border-y border-pink-100 bg-white py-8 sm:py-10">
    <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
      {features.map(({ icon: Icon, title, description, iconClass }) => (
        <div key={title} className="flex items-center gap-4 rounded-2xl p-4 transition hover:bg-pink-50/70">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-bold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm leading-5 text-gray-500">{description}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Features;
