import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, Mail, Search, ShoppingBag, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setUser } from "@/redux/userSlice";
import ekartLogo from "@/assets/ekart.webp";
import { userApi } from "@/lib/api";

const Login = ({ adminOnly = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "email") setNeedsVerification(false);
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await userApi.post(adminOnly ? "/admin/login" : "/login", formData);

      if (response.data.success) {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        dispatch(setUser(response.data.user));
        navigate(adminOnly ? "/admin/users" : "/");
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || error.message || "Login failed";
      setNeedsVerification(/verify your account/i.test(message));
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!formData.email.trim()) {
      toast.error("Enter your email address first");
      return;
    }
    setLoading(true);
    try {
      const response = await userApi.post("/reverify", { email: formData.email.trim() });
      toast.success(response.data.message || "Verification email sent. Check your inbox.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not resend verification email");
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
              <p className="mt-10 text-sm font-bold uppercase tracking-[0.2em] text-pink-100">Welcome to Ekart</p>
              <h1 className="mt-4 max-w-sm text-4xl font-black leading-tight xl:text-5xl">Good to have you back.</h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-pink-50">Sign in to pick up where you left off and keep discovering everyday favorites.</p>
            </div>
            <div className="relative my-8 overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />
              <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-pink-100">Explore the collection</p>
              <div className="relative mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Discover", icon: Search },
                  { label: "Find favorites", icon: Star },
                  { label: "Shop", icon: ShoppingBag },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-3 text-center">
                    <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                    <span className="text-xs font-semibold text-pink-50">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 shrink-0 text-pink-100" aria-hidden="true" />
              <p className="text-sm font-medium text-white">Your favorites and saved cart are just a sign-in away.</p>
            </div>
          </section>

          <Card className="gap-0 rounded-none border-0 bg-white py-0 shadow-none ring-0">
            <CardHeader className="px-5 pb-4 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 lg:hidden">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-pink-600">{adminOnly ? "Ekart administration" : "Your account"}</p>
              <CardTitle className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">{adminOnly ? "Admin log in" : "Log in"}</CardTitle>
              <CardDescription className="mt-2 text-sm leading-6 text-gray-500">{adminOnly ? "Sign in with an administrator account to manage Ekart." : "Enter your email and password to continue shopping."}</CardDescription>
            </CardHeader>
            <form onSubmit={submitHandler}>
              <CardContent className="space-y-4 px-5 sm:px-8 lg:px-10">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="h-12 min-w-0 flex-1 rounded-xl border-gray-200 bg-gray-50/70 px-4 text-sm placeholder:text-gray-400 focus-visible:border-pink-400 focus-visible:ring-pink-100"
                    />
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-pink-100 bg-pink-50 text-pink-600">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                  <div className="flex gap-2">
                    <div className="relative min-w-0 flex-1">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                      <Input
                        id="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="h-12 w-full rounded-xl border-gray-200 bg-gray-50/70 pl-11 pr-4 text-sm placeholder:text-gray-400 focus-visible:border-pink-400 focus-visible:ring-pink-100"
                      />
                    </div>
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-pink-100 bg-pink-50 text-pink-600 transition hover:border-pink-200 hover:bg-pink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300">
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                  <Link to="/forgot-password" className="mt-1 self-end text-xs font-semibold text-pink-700 transition hover:text-pink-800 hover:underline sm:text-sm">Forgot password?</Link>
                  {needsVerification && <button type="button" onClick={resendVerification} disabled={loading} className="mt-1 self-start text-sm font-semibold text-pink-700 hover:text-pink-800 hover:underline disabled:opacity-50">Resend verification email</button>}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4 px-5 pb-6 pt-6 sm:px-8 lg:px-10 lg:pb-8">
                <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-pink-600 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-700">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing you in...</> : "Log in to your account"}
                </Button>
                {adminOnly ? <p className="text-center text-sm text-gray-500">Store customer? <Link to="/login" className="font-bold text-pink-700 hover:text-pink-800 hover:underline">Customer log in</Link></p> : <p className="text-center text-sm text-gray-500">Don&apos;t have an account? <Link to="/signup" className="font-bold text-pink-700 hover:text-pink-800 hover:underline">Create an account</Link></p>}
              </CardFooter>
            </form>
          </Card>
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">Welcome back to Ekart.</p>
      </div>
    </main>
  );
};

export default Login;
