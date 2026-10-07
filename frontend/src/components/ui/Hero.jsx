import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/ekart-hero1.png";

const Hero = () => (
  <section className="relative isolate overflow-hidden bg-[#fff7fa]">
    <div className="absolute -right-40 -top-48 -z-10 h-[36rem] w-[36rem] rounded-full bg-pink-200/50 blur-3xl" />
    <div className="absolute -bottom-48 left-1/4 -z-10 h-96 w-96 rounded-full bg-rose-100/80 blur-3xl" />
    <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:py-16 lg:gap-12 lg:px-8">
      <div className="relative z-10 py-5 md:py-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-pink-700 shadow-sm">
          <Sparkles className="h-4 w-4" aria-hidden="true" /> Discover something new
        </span>
        <h1 className="mt-6 max-w-xl text-4xl font-black leading-[1.08] tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
          Good finds. <span className="text-pink-600">Great feelings.</span>
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-gray-600 sm:text-lg">
          Explore everyday favorites across fashion, beauty, home, and more—all in one place.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/products" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-pink-600 px-6 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:bg-pink-700 hover:shadow-xl">
            Shop the collection <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a href="#featured" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 text-sm font-bold text-gray-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700">
            See featured picks <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <div className="mt-9 flex items-center gap-3 text-sm text-gray-500">
          <span className="flex -space-x-2" aria-hidden="true">
            <span className="h-8 w-8 rounded-full border-2 border-[#fff7fa] bg-pink-200" />
            <span className="h-8 w-8 rounded-full border-2 border-[#fff7fa] bg-rose-300" />
            <span className="h-8 w-8 rounded-full border-2 border-[#fff7fa] bg-fuchsia-200" />
          </span>
          <span>Thoughtful picks for everyday life</span>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-2xl">
        <div className="absolute inset-6 rounded-[2.5rem] bg-gradient-to-br from-pink-300/50 to-fuchsia-200/50 blur-2xl" />
        <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/50 p-3 shadow-2xl shadow-pink-200/50 backdrop-blur-sm sm:rounded-[2.5rem] sm:p-5">
          <img src={heroImage} alt="A selection of products available at Ekart" width={900} height={700} className="h-[300px] w-full rounded-[1.5rem] object-cover sm:h-[390px] sm:rounded-[2rem] md:h-[430px]" />
          <div className="absolute bottom-7 left-7 right-7 flex items-center justify-between rounded-2xl border border-white/80 bg-white/90 p-4 shadow-lg backdrop-blur-md sm:bottom-9 sm:left-9 sm:right-9 sm:p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-pink-600">Your next favorite</p>
              <p className="mt-1 font-bold text-gray-900">Start exploring the collection</p>
            </div>
            <Link to="/products" aria-label="Explore products" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-600 text-white transition hover:bg-pink-700">
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
