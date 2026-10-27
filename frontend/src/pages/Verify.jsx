import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { userApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Verify = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(false);

  const resendVerification = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await userApi.post("/reverify", { email: email.trim() });
      toast.success(response.data.message || "Verification email sent.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not resend the verification email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-pink-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">Check your email</h1>
        <p className="text-sm leading-6 text-gray-500">
          We sent you a verification link. Open it to finish creating your account.
        </p>
        <form onSubmit={resendVerification} className="mt-6 space-y-3 text-left">
          <label htmlFor="verification-email" className="text-sm font-medium text-gray-700">Resend a verification link</label>
          <Input
            id="verification-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
          <Button type="submit" disabled={loading} className="w-full bg-pink-600 hover:bg-pink-700">
            {loading ? "Sending..." : "Resend verification email"}
          </Button>
        </form>
        <p className="mt-5 text-sm text-gray-500">Already verified? <Link to="/login" className="font-semibold text-pink-700 hover:underline">Log in</Link></p>
      </section>
    </main>
  );
};

export default Verify;
