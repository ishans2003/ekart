import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Heart, Loader2, LockKeyhole, Mail, PackageCheck, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ekartLogo from "@/assets/ekart.webp";
import { userApi } from "@/lib/api";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await userApi.post("/register", formData);

      if (response.data.success) {
        navigate("/verify", { state: { email: formData.email.trim() } });
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Account registration failed:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-dvh w-full items-center overflow-x-hidden bg-[#fff7fa] px-3 py-4 sm:px-6 sm:py-6">
      <div className="absolute -left-40 top-0 -z-10 h-96 w-96 rounded-full bg-pink-200/50 blur-3xl" />
      <div className="absolute -bottom-48 right-0 -z-10 h-[32rem] w-[32rem] rounded-full bg-rose-200/50 blur-3xl" />
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5 flex items-center justify-between sm:mb-6">
          <Link to="/" aria-label="Back to Ekart home" className="rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200">
            <img src={ekartLogo} alt="Ekart" className="h-auto w-28" />
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-pink-700">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">Back to store</span>
          </Link>
        </div>

        <div className="grid min-w-0 overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-2xl shadow-pink-200/40 lg:grid-cols-[0.9fr_1.1fr] lg:rounded-[2rem]">
          <section className="relative hidden min-w-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-pink-600 via-rose-500 to-fuchsia-600 p-8 text-white lg:flex xl:p-10">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[40px] border-white/10" />
            <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-lg backdrop-blur-sm">
                <ShoppingBag className="h-7 w-7" aria-hidden="true" />
              </span>
              <p className="mt-10 text-sm font-bold uppercase tracking-[0.2em] text-pink-100">Make yourself at home</p>
              <h1 className="mt-4 max-w-sm text-4xl font-black leading-tight xl:text-5xl">A better way to find your favorites.</h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-pink-50">Create your Ekart account and start exploring a collection made for everyday life.</p>
            </div>
            <div className="relative my-8 overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <div className="absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
              <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-pink-100">Your shopping, your way</p>
              <div className="relative mt-4 space-y-3">
                {[
                  { label: "Build a collection of favorites", icon: Heart },
                  { label: "Keep your cart close by", icon: ShoppingBag },
                  { label: "Pick up whenever you’re ready", icon: PackageCheck },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <span className="text-sm font-medium text-pink-50">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 shrink-0 text-pink-100" aria-hidden="true" />
              <p className="text-sm font-medium text-white">Save your cart and pick up whenever you’re ready.</p>
            </div>
          </section>

          <Card className="gap-0 rounded-none border-0 bg-white py-0 shadow-none ring-0">
            <CardHeader className="px-5 pb-4 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 lg:hidden">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-pink-600">Join Ekart</p>
              <CardTitle className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">Create your account</CardTitle>
              <CardDescription className="mt-2 text-sm leading-6 text-gray-500">A few details and you’ll be ready to explore.</CardDescription>
            </CardHeader>
            <form onSubmit={submitHandler}>
              <CardContent className="space-y-4 px-5 sm:px-8 lg:px-10">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First name</Label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                      <Input id="firstName" name="firstName" type="text" autoComplete="given-name" placeholder="Jane" required value={formData.firstName} onChange={handleChange} className="h-12 rounded-xl border-gray-200 bg-gray-50/70 pl-11 pr-4 text-sm placeholder:text-gray-400 focus-visible:border-pink-400 focus-visible:ring-pink-100" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Last name</Label>
                    <Input id="lastName" name="lastName" type="text" autoComplete="family-name" placeholder="Doe" required value={formData.lastName} onChange={handleChange} className="h-12 rounded-xl border-gray-200 bg-gray-50/70 px-4 text-sm placeholder:text-gray-400 focus-visible:border-pink-400 focus-visible:ring-pink-100" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email address</Label>
                  <div className="relative">
                    <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required value={formData.email} onChange={handleChange} className="h-12 rounded-xl border-gray-200 bg-gray-50/70 px-4 pr-11 text-sm placeholder:text-gray-400 focus-visible:border-pink-400 focus-visible:ring-pink-100" />
                    <Mail className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <Input id="password" name="password" autoComplete="new-password" placeholder="Create a password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} className="h-12 rounded-xl border-gray-200 bg-gray-50/70 pl-11 pr-12 text-sm placeholder:text-gray-400 focus-visible:border-pink-400 focus-visible:ring-pink-100" />
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-pink-50 hover:text-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300">
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Use a password you haven’t used elsewhere.</p>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4 px-5 pb-6 pt-6 sm:px-8 lg:px-10 lg:pb-8">
                <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-pink-600 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-700">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating your account...</> : "Create account"}
                </Button>
                <p className="text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="font-bold text-pink-700 hover:text-pink-800 hover:underline">Log in</Link></p>
              </CardFooter>
            </form>
          </Card>
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">By creating an account, you can save your cart on this device.</p>
      </div>
    </main>
  );
};

export default Signup;
