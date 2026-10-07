import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ekartLogo from "@/assets/ekart.webp";
import { userApi } from "@/lib/api";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requestOtp = async (event) => {
    event?.preventDefault();
    setLoading(true);
    try {
      const response = await userApi.post("/forgot-password", { email: email.trim() });
      if (response.data.success) {
        setStep(2);
        toast.success(response.data.message || "A reset code was sent to your email");
      } else {
        toast.error(response.data.message || "Could not send reset code");
      }
    } catch (error) {
      console.error("Requesting password reset failed:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      toast.error(error.response?.data?.message || "Could not send reset code");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await userApi.post(`/verify-otp/${encodeURIComponent(email)}`, { otp });
      if (response.data.success) {
        setStep(3);
        toast.success("Code verified. Choose a new password.");
      } else {
        toast.error(response.data.message || "That code could not be verified");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "That code could not be verified");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await userApi.post(`/change-password/${encodeURIComponent(email)}`, { newPassword, confirmPassword });
      if (response.data.success) {
        toast.success(response.data.message || "Password changed successfully");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Could not change password");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not change password");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Email", "Verify", "New password"];
  const stepContent = [
    {
      icon: Mail,
      title: "Reset your password",
      description: "Enter the email address on your account and we’ll send you a verification code.",
      submit: requestOtp,
      button: "Send verification code",
    },
    {
      icon: ShieldCheck,
      title: "Check your email",
      description: `Enter the 6-digit verification code sent to ${email}. The code expires after 10 minutes.`,
      submit: verifyOtp,
      button: "Verify code",
    },
    {
      icon: KeyRound,
      title: "Choose a new password",
      description: "Create a new password for your account.",
      submit: resetPassword,
      button: "Save new password",
    },
  ][step - 1];
  const StepIcon = stepContent.icon;

  return (
    <main className="relative isolate flex min-h-dvh w-full items-center overflow-x-hidden bg-[#fff7fa] px-3 py-4 sm:px-6 sm:py-6">
      <div className="absolute -left-40 top-0 -z-10 h-96 w-96 rounded-full bg-pink-200/50 blur-3xl" />
      <div className="absolute -bottom-48 right-0 -z-10 h-[32rem] w-[32rem] rounded-full bg-rose-200/50 blur-3xl" />
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-5 flex items-center justify-between sm:mb-6">
          <Link to="/" aria-label="Ekart home" className="rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200">
            <img src={ekartLogo} alt="Ekart" className="h-auto w-28" />
          </Link>
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-pink-700">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to login
          </Link>
        </div>

        <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-2xl shadow-pink-200/40 sm:rounded-[2rem]">
          <div className="h-2 bg-gray-100">
            <div className="h-full rounded-r-full bg-gradient-to-r from-pink-500 to-fuchsia-500 transition-all" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <Card className="gap-0 rounded-none border-0 bg-white py-0 shadow-none ring-0">
            <CardHeader className="px-5 pb-5 pt-7 sm:px-9 sm:pt-9">
              <div className="mb-5 flex items-center gap-2" aria-label={`Step ${step} of 3`}>
                {steps.map((label, index) => {
                  const stepNumber = index + 1;
                  const isComplete = stepNumber < step;
                  const isCurrent = stepNumber === step;
                  return (
                    <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isComplete ? "bg-pink-600 text-white" : isCurrent ? "bg-pink-100 text-pink-700 ring-2 ring-pink-200" : "bg-gray-100 text-gray-400"}`}>
                        {isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : stepNumber}
                      </span>
                      <span className={`hidden truncate text-xs font-semibold sm:block ${isCurrent ? "text-pink-700" : "text-gray-400"}`}>{label}</span>
                      {stepNumber < 3 && <span className="h-px min-w-2 flex-1 bg-gray-200" />}
                    </div>
                  );
                })}
              </div>
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
                <StepIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-pink-600">Account recovery</p>
              <CardTitle className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">{stepContent.title}</CardTitle>
              <CardDescription className="mt-2 text-sm leading-6 text-gray-500">{stepContent.description}</CardDescription>
            </CardHeader>

            <form onSubmit={stepContent.submit}>
              <CardContent className="space-y-4 px-5 sm:px-9">
                {step === 1 && (
                  <div className="grid gap-2">
                    <Label htmlFor="reset-email" className="text-sm font-semibold text-gray-700">Email address</Label>
                    <Input id="reset-email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-xl border-gray-200 bg-gray-50/70 px-4 text-sm focus-visible:border-pink-400 focus-visible:ring-pink-100" />
                  </div>
                )}
                {step === 2 && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="reset-otp" className="text-sm font-semibold text-gray-700">Verification code</Label>
                      <Input id="reset-otp" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter your 6-digit code" required minLength={6} maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} className="h-12 rounded-xl border-gray-200 bg-gray-50/70 px-4 text-center text-lg font-bold tracking-[0.4em] focus-visible:border-pink-400 focus-visible:ring-pink-100" />
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                      <button type="button" onClick={() => setStep(1)} className="font-semibold text-gray-500 hover:text-pink-700">Change email</button>
                      <button type="button" onClick={requestOtp} disabled={loading} className="font-semibold text-pink-700 hover:text-pink-800 hover:underline disabled:opacity-50">Resend code</button>
                    </div>
                  </>
                )}
                {step === 3 && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password" className="text-sm font-semibold text-gray-700">New password</Label>
                      <Input id="new-password" type="password" autoComplete="new-password" placeholder="Enter a new password" required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="h-12 rounded-xl border-gray-200 bg-gray-50/70 px-4 text-sm focus-visible:border-pink-400 focus-visible:ring-pink-100" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password" className="text-sm font-semibold text-gray-700">Confirm new password</Label>
                      <Input id="confirm-password" type="password" autoComplete="new-password" placeholder="Enter it again" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-12 rounded-xl border-gray-200 bg-gray-50/70 px-4 text-sm focus-visible:border-pink-400 focus-visible:ring-pink-100" />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-4 px-5 pb-7 pt-6 sm:px-9 sm:pb-9">
                <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-pink-600 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-700">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...</> : stepContent.button}
                </Button>
                <p className="text-center text-sm text-gray-500">Remembered your password? <Link to="/login" className="font-bold text-pink-700 hover:text-pink-800 hover:underline">Log in</Link></p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
