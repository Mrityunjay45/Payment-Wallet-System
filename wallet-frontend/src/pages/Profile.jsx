
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, UserRound, Mail, Wallet, LockKeyhole,
  Save, LoaderCircle, ShieldCheck, LogOut
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileResponse, walletResponse] = await Promise.all([
          api.get("/users/me"),
          api.get("/wallets/me"),
        ]);

        setProfile(profileResponse.data);
        setName(profileResponse.data.name || "");
        setWallet(walletResponse.data);
      } catch (error) {
        console.error("Profile loading error:", error.response?.data || error);
        toast.error(
          error.response?.data?.message || "Unable to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileUpdate = async (event) => {
    event.preventDefault();

    if (name.trim().length < 2) {
      toast.error("Name must contain at least 2 characters.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.put("/users/me", {
        name: name.trim(),
      });

      setProfile(response.data);
      setName(response.data.name);
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Choose a different password.");
      return;
    }

    setChangingPassword(true);

    try {
      await api.patch("/users/me/password", {
        currentPassword,
        newPassword,
      });

      toast.success("Password changed. Please sign in again.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // JWTs are stateless in this project. Sign out locally
      // so the user authenticates again with the new password.
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Password change error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Unable to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <LoaderCircle className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f5f7fa]">
        <p className="text-slate-600">Unable to load your profile.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white"
        >
          Return to dashboard
        </button>
      </div>
    );
  }

  const initials = (profile.name || "VP")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-10">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500 p-2 text-slate-950">
            <Wallet size={22} />
          </div>
          <span className="text-xl font-bold text-slate-900">
            Vault<span className="text-emerald-500">Pay</span>
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </header>

      <main className="mx-auto max-w-5xl space-y-7 p-5 py-9 md:p-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Profile & Settings
          </h1>
          <p className="mt-2 text-slate-500">
            Manage your personal information and account security.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-[#101c2c] p-7 text-white md:p-9">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-2xl font-bold text-slate-950 ring-4 ring-white/10">
                {initials}
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  {profile.name}
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  {profile.email}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <ShieldCheck size={14} />
                  Authenticated account
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Wallet size={17} />
                Wallet ID
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                #{wallet?.walletId ?? "—"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Wallet size={17} />
                Available balance
              </div>
              <p className="mt-3 text-2xl font-bold text-emerald-600">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(Number(wallet?.balance || 0))}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-bold text-slate-900">
              Personal information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update the name associated with your VaultPay account.
            </p>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Full name
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 px-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                <UserRound size={18} className="text-slate-400" />
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent px-3 py-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full cursor-not-allowed bg-transparent px-3 py-3 text-slate-500 outline-none"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Email address cannot be changed here.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving || name.trim() === profile.name}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-7">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <LockKeyhole size={21} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Change password
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Verify your current password before setting a new one.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-5">
            {[
              {
                label: "Current password",
                value: currentPassword,
                setter: setCurrentPassword,
                placeholder: "Enter current password",
              },
              {
                label: "New password",
                value: newPassword,
                setter: setNewPassword,
                placeholder: "At least 8 characters",
              },
              {
                label: "Confirm new password",
                value: confirmPassword,
                setter: setConfirmPassword,
                placeholder: "Re-enter new password",
              },
            ].map((field) => (
              <div key={field.label}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {field.label}
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 px-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <LockKeyhole size={18} className="text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={field.label === "Current password" ? undefined : 8}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-transparent px-3 py-3 outline-none"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={changingPassword}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#101c2c] px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {changingPassword && (
                <LoaderCircle size={18} className="animate-spin" />
              )}
              {changingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </section>

        <footer className="pb-5 text-center text-xs text-slate-400">
          VaultPay · Account security and settings
        </footer>
      </main>
    </div>
  );
}
