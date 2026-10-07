import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authConfig, userApi } from "@/lib/api";
import { setUser } from "@/redux/userSlice";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Pencil,
  Mail,
  MapPin,
  Package,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 border-b border-gray-100 py-4 last:border-0 last:pb-0">
    <span className="mt-0.5 rounded-lg bg-pink-50 p-2 text-pink-600">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-gray-800">{value || "Not added yet"}</p>
    </div>
  </div>
);

const Profile = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState(() => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNo: user?.phoneNo || "",
    address: user?.address || "",
    city: user?.city || "",
    zipCode: user?.zipCode || "",
  }));

  useEffect(() => {
    if (!user?._id) return;
    const controller = new AbortController();
    userApi.get(`/get-user/${user._id}`, { ...authConfig(), signal: controller.signal })
      .then((response) => {
        if (response.data.success) dispatch(setUser(response.data.user));
      })
      .catch((error) => {
        if (error.name !== "CanceledError") console.error("Could not refresh profile:", error.response?.data?.message || error.message);
      });
    return () => controller.abort();
  }, [dispatch, user?._id]);
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Ekart member";
  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "E";
  const address = [user?.address, user?.city, user?.zipCode].filter(Boolean).join(", ");

  const handleDetailsChange = (event) => {
    const { name, value } = event.target;
    setDetails((current) => ({ ...current, [name]: value }));
  };

  const startEditing = () => {
    setDetails({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNo: user?.phoneNo || "",
      address: user?.address || "",
      city: user?.city || "",
      zipCode: user?.zipCode || "",
    });
    setEditing(true);
  };

  const saveDetails = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await userApi.patch("/profile", details, authConfig());
      dispatch(setUser(response.data.user));
      setEditing(false);
      toast.success(response.data.message || "Profile updated successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-[75vh] bg-gradient-to-b from-pink-50 via-white to-white px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-600">Your account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Profile</h1>
          <p className="mt-2 text-gray-500">Manage your personal details and keep your account up to date.</p>
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 to-rose-500 p-6 text-white shadow-lg shadow-pink-200/60 sm:p-8">
          <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border-[32px] border-white/10" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/20 text-2xl font-bold shadow-md">
                {initials}
              </div>
              <div>
                <p className="text-sm font-medium text-pink-100">Welcome back</p>
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{fullName}</h2>
                <p className="mt-1 text-sm text-pink-100">{user?.email || "Sign in to view your account details"}</p>
              </div>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              {user?.isVerified ? "Verified account" : user ? "Account" : "Guest profile"}
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-2 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Personal information</h2>
                <p className="mt-1 text-sm text-gray-500">Your details for a smoother checkout.</p>
              </div>
              {user && !editing && <Button type="button" variant="outline" onClick={startEditing} className="gap-2 rounded-xl border-pink-100 text-pink-700 hover:bg-pink-50"><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</Button>}
            </div>
            {!editing ? (
              <>
                <InfoRow icon={UserRound} label="Full name" value={fullName === "Ekart member" ? "Not added yet" : fullName} />
                <InfoRow icon={Mail} label="Email address" value={user?.email} />
                <InfoRow icon={Phone} label="Phone number" value={user?.phoneNo} />
                <InfoRow icon={MapPin} label="Delivery address" value={address} />
                {!user && <Link to="/login" className="mt-4 inline-flex rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700">Log in to edit your details</Link>}
              </>
            ) : (
              <form onSubmit={saveDetails} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-gray-700" htmlFor="profile-first-name">First name
                    <input id="profile-first-name" name="firstName" autoComplete="given-name" maxLength={80} required value={details.firstName} onChange={handleDetailsChange} className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 font-normal outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-gray-700" htmlFor="profile-last-name">Last name
                    <input id="profile-last-name" name="lastName" autoComplete="family-name" maxLength={80} required value={details.lastName} onChange={handleDetailsChange} className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 font-normal outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100" />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-medium text-gray-700" htmlFor="profile-phone">Phone number
                  <input id="profile-phone" name="phoneNo" type="tel" autoComplete="tel" maxLength={20} value={details.phoneNo} onChange={handleDetailsChange} placeholder="+1 555 123 4567" className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 font-normal outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100" />
                </label>
                <label className="grid gap-2 text-sm font-medium text-gray-700" htmlFor="profile-address">Street address
                  <input id="profile-address" name="address" autoComplete="street-address" maxLength={200} value={details.address} onChange={handleDetailsChange} placeholder="Street and house number" className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 font-normal outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-gray-700" htmlFor="profile-city">City
                    <input id="profile-city" name="city" autoComplete="address-level2" maxLength={100} value={details.city} onChange={handleDetailsChange} placeholder="City" className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 font-normal outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-gray-700" htmlFor="profile-zip">ZIP / postal code
                    <input id="profile-zip" name="zipCode" autoComplete="postal-code" maxLength={20} value={details.zipCode} onChange={handleDetailsChange} placeholder="Postal code" className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 font-normal outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100" />
                  </label>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button type="submit" disabled={saving} className="gap-2 rounded-xl bg-pink-600 px-5 text-white hover:bg-pink-700"><Save className="h-4 w-4" aria-hidden="true" />{saving ? "Saving..." : "Save details"}</Button>
                  <Button type="button" variant="outline" disabled={saving} onClick={() => { setDetails({ firstName: user?.firstName || "", lastName: user?.lastName || "", phoneNo: user?.phoneNo || "", address: user?.address || "", city: user?.city || "", zipCode: user?.zipCode || "" }); setEditing(false); }} className="gap-2 rounded-xl"><X className="h-4 w-4" aria-hidden="true" />Cancel</Button>
                </div>
              </form>
            )}
          </section>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <Link to="/orders" className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-pink-200 hover:shadow-md sm:p-6">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                  <Package className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-semibold text-gray-900">Your orders</h2>
                  <p className="text-sm text-gray-500">Keep track of your purchases</p>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">
                View your order history and delivery updates.
              </p>
            </Link>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-semibold text-gray-900">Account security</h2>
                  <p className="text-sm text-gray-500">{user ? "Your account is ready to shop" : "Sign in to view account status"}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800">
                <span className="font-medium">Email verification</span>
                <span className="inline-flex items-center gap-1.5">{user?.isVerified ? <><BadgeCheck className="h-4 w-4" aria-hidden="true" /> Verified</> : user ? "Not verified" : "Sign in"}</span>
              </div>
            </section>
          </div>
        </div>

        <Link to="/" className="group mt-6 flex items-center justify-between rounded-2xl border border-pink-100 bg-white px-5 py-4 shadow-sm transition hover:border-pink-200 hover:shadow-md sm:px-6">
          <span className="flex items-center gap-3">
            <span className="rounded-xl bg-pink-50 p-2.5 text-pink-600"><CalendarDays className="h-5 w-5" aria-hidden="true" /></span>
            <span><span className="block font-semibold text-gray-900">Continue shopping</span><span className="mt-0.5 block text-sm text-gray-500">Find something you’ll love at Ekart.</span></span>
          </span>
          <span className="flex items-center gap-2 text-sm font-semibold text-pink-600">Shop now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /><ChevronRight className="h-4 w-4 sm:hidden" aria-hidden="true" /></span>
        </Link>
      </div>
    </main>
  );
};

export default Profile;
