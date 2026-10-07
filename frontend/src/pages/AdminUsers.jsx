import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, RefreshCw, Search, Users } from "lucide-react";
import { useSelector } from "react-redux";
import { authConfig, userApi } from "@/lib/api";

const AdminUsers = () => {
  const currentUser = useSelector((state) => state.user.user);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (currentUser?.role !== "admin") return undefined;
    const controller = new AbortController();
    userApi.get("/all-user", { ...authConfig(), signal: controller.signal })
      .then((response) => setUsers(Array.isArray(response.data.users) ? response.data.users : []))
      .catch((requestError) => {
        if (requestError.name !== "CanceledError") {
          setError(requestError.response?.data?.message || "Could not load users. Please try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [currentUser?.role, retry]);

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => `${user.firstName} ${user.lastName} ${user.email} ${user.role}`.toLowerCase().includes(query));
  }, [users, search]);

  if (currentUser?.role !== "admin") {
    return (
      <main className="min-h-[70vh] bg-gradient-to-b from-pink-50 via-white to-white px-4 py-16">
        <section className="mx-auto max-w-lg rounded-3xl border border-pink-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-pink-600" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Admin access required</h1>
          <p className="mt-2 text-sm text-gray-500">Log in with an administrator account to view the user directory.</p>
          <Link to="/admin/login" className="mt-5 inline-flex rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-700">Admin log in</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] bg-gradient-to-b from-pink-50 via-white to-white px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-600">Administration</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">User directory</h1>
            <p className="mt-2 text-gray-500">Review registered Ekart accounts and their verification status.</p>
          </div>
          {!loading && !error && <span className="rounded-full border border-pink-100 bg-white px-4 py-2 text-sm font-semibold text-gray-600"><span className="text-pink-600">{users.length}</span> accounts</span>}
        </header>

        <section className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4 sm:p-5">
            <label className="relative block max-w-md">
              <span className="sr-only">Search users</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-500" aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, or role" className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100" />
            </label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-gray-500"><RefreshCw className="h-4 w-4 animate-spin" /> Loading accounts...</div>
          ) : error ? (
            <div role="alert" className="px-6 py-14 text-center">
              <AlertCircle className="mx-auto h-9 w-9 text-red-500" aria-hidden="true" />
              <p className="mt-3 text-sm text-gray-600">{error}</p>
              <button type="button" onClick={() => { setLoading(true); setError(""); setRetry((value) => value + 1); }} className="mt-4 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700">Try again</button>
            </div>
          ) : visibleUsers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Users className="mx-auto h-9 w-9 text-pink-400" aria-hidden="true" />
              <p className="mt-3 text-sm text-gray-500">{users.length ? "No users match your search." : "No registered users yet."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr><th className="px-5 py-3 font-semibold">Name</th><th className="px-5 py-3 font-semibold">Email</th><th className="px-5 py-3 font-semibold">Role</th><th className="px-5 py-3 font-semibold">Verification</th><th className="px-5 py-3 font-semibold">Joined</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-pink-50/40">
                      <td className="px-5 py-4 font-medium text-gray-900">{[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}</td>
                      <td className="px-5 py-4 text-gray-600">{user.email}</td>
                      <td className="px-5 py-4 capitalize text-gray-600">{user.role}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{user.isVerified ? "Verified" : "Pending"}</span></td>
                      <td className="px-5 py-4 text-gray-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminUsers;
