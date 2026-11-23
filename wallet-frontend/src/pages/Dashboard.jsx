import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Wallet, LayoutDashboard, ArrowLeftRight, History,
  LogOut, Plus, ArrowDownLeft, ArrowUpRight,
  Send, Bell, Search, RefreshCw, X, LoaderCircle,
  TrendingUp, TrendingDown, Menu, ChevronLeft,
  ChevronRight, CircleDollarSign
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const getTransactionDate = (tx) =>
  tx.createdAt || tx.timestamp || tx.transactionDate || tx.date || null;

const getTransactionType = (tx) =>
  String(tx.type || tx.transactionType || "TRANSACTION").toUpperCase();

const getTransactionAmount = (tx) =>
  Number(tx.amount ?? 0);

function ActionModal({ action, walletId, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [receiverWalletId, setReceiverWalletId] = useState("");
  const [loading, setLoading] = useState(false);

  const config = {
    deposit: {
      title: "Add money",
      description: "Deposit money into your VaultPay wallet.",
      button: "Deposit money",
      endpoint: `/api/wallets/${walletId}/deposit`,
      icon: ArrowDownLeft,
    },
    withdraw: {
      title: "Withdraw money",
      description: "Withdraw money from your wallet.",
      button: "Withdraw money",
      endpoint: `/api/wallets/${walletId}/withdraw`,
      icon: ArrowUpRight,
    },
    transfer: {
      title: "Transfer money",
      description: "Send money to another VaultPay wallet.",
      button: "Transfer money",
      endpoint: `/api/wallets/${walletId}/transfer`,
      icon: Send,
    },
  }[action];

  const Icon = config.icon;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    if (action === "transfer") {
      if (!receiverWalletId || !Number.isInteger(Number(receiverWalletId)) ||
          Number(receiverWalletId) <= 0) {
        toast.error("Enter a valid receiver wallet ID.");
        return;
      }

      if (Number(receiverWalletId) === Number(walletId)) {
        toast.error("You cannot transfer to your own wallet.");
        return;
      }
    }

    setLoading(true);

    try {
      const payload =
        action === "transfer"
          ? {
              receiverWalletId: Number(receiverWalletId),
              amount: numericAmount,
            }
          : { amount: numericAmount };

      await api.post(config.endpoint, payload);

      toast.success(
        action === "deposit"
          ? "Money deposited successfully."
          : action === "withdraw"
          ? "Withdrawal successful."
          : "Transfer completed successfully."
      );

      await onSuccess();
      onClose();
    } catch (error) {
      console.error("Wallet operation failed:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Transaction failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Icon size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {config.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {config.description}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {action === "transfer" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Receiver wallet ID
              </label>
              <input
                type="number"
                min="1"
                required
                value={receiverWalletId}
                onChange={(e) => setReceiverWalletId(e.target.value)}
                placeholder="Enter receiver wallet ID"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Amount (INR)
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 px-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
              <span className="text-lg text-slate-400">₹</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full border-0 px-3 py-3 text-lg outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading && <LoaderCircle size={18} className="animate-spin" />}
            {loading ? "Processing..." : config.button}
          </button>
        </form>
      </div>
    </div>
  );
}

function Sidebar({ active, onNavigate, onLogout, mobileOpen, setMobileOpen }) {
  const links = [
    { label: "Overview", icon: LayoutDashboard, id: "overview" },
    { label: "Transactions", icon: History, id: "transactions" },
    { label: "Transfers", icon: ArrowLeftRight, id: "transfers" },
  ];

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#101c2c] text-white transition-transform lg:static lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-7">
          <div className="rounded-xl bg-emerald-500 p-2 text-slate-950">
            <Wallet size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Vault<span className="text-emerald-400">Pay</span>
          </span>
        </div>

        <div className="px-5 pt-8">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>
          <nav className="space-y-2">
            {links.map(({ label, icon: Icon, id }) => (
              <button
                key={id}
                onClick={() => {
                  onNavigate(id);
                  setMobileOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  active === id
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-5">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />
            Sign out
          </button>
          <p className="mt-4 px-4 text-xs text-slate-600">
            VaultPay · Secure wallet
          </p>
        </div>
      </aside>
    </>
  );
}

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [active, setActive] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const loadDashboard = useCallback(async (requestedPage = page) => {
    setLoading(true);
    setError("");

    try {
      const walletResponse = await api.get("/api/wallets/me");
      const walletData = walletResponse.data;
      setWallet(walletData);

      const historyResponse = await api.get(
        `/api/wallets/${walletData.walletId}/transactions`,
        { params: { page: requestedPage, size: 8 } }
      );

      const history = historyResponse.data;
      setTransactions(history.content || []);
      setTotalPages(history.totalPages || 0);
      setTotalElements(history.totalElements || 0);
    } catch (err) {
      console.error("Dashboard loading failed:", err.response?.data || err);
      setError(
        err.response?.data?.message ||
        "Unable to load wallet information. Please refresh."
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadDashboard(page);
  }, [page, loadDashboard]);

  const chartData = useMemo(() => {
    const grouped = {};

    [...transactions].reverse().forEach((tx) => {
      const rawDate = getTransactionDate(tx);
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return;

      const label = date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });

      grouped[label] = (grouped[label] || 0) + getTransactionAmount(tx);
    });

    return Object.entries(grouped).map(([date, amount]) => ({
      date,
      amount,
    }));
  }, [transactions]);

  const transactionCounts = useMemo(() => {
    let deposits = 0;
    let withdrawals = 0;
    let transfers = 0;

    transactions.forEach((tx) => {
      const type = getTransactionType(tx);
      if (type.includes("DEPOSIT")) deposits++;
      else if (type.includes("WITHDRAW")) withdrawals++;
      else if (type.includes("TRANSFER")) transfers++;
    });

    return { deposits, withdrawals, transfers };
  }, [transactions]);

  const openAction = (action) => setModal(action);

  const changeSection = (section) => {
    setActive(section);

    if (section === "transactions") {
      document.getElementById("transaction-section")?.scrollIntoView({
        behavior: "smooth",
      });
    } else if (section === "transfers") {
      setModal("transfer");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getTransactionLabel = (tx) => {
    const type = getTransactionType(tx);
    if (type.includes("DEPOSIT")) return "Deposit";
    if (type.includes("WITHDRAW")) return "Withdrawal";
    if (type.includes("TRANSFER")) return "Transfer";
    return type;
  };
  const getCounterpartyLabel = (tx) => {
  const type = getTransactionType(tx);

  if (type.includes("DEPOSIT")) {
    return "Money added to wallet";
  }

  if (type.includes("WITHDRAW")) {
    return "Money withdrawn";
  }

  if (type.includes("TRANSFER")) {
    if (Number(tx.senderWalletId) === Number(wallet?.walletId)) {
      return `To: ${tx.receiverName || "Recipient"} · Wallet #${tx.receiverWalletId}`;
    }

    return `From: ${tx.senderName || "Sender"} · Wallet #${tx.senderWalletId}`;
  }

  return "Wallet transaction";
};

  const getTransactionIcon = (tx) => {
    const type = getTransactionType(tx);
    if (type.includes("DEPOSIT")) return ArrowDownLeft;
    if (type.includes("WITHDRAW")) return ArrowUpRight;
    return Send;
  };

  const isCredit = (tx) => {
    const type = getTransactionType(tx);
    return type.includes("DEPOSIT") ||
      (type.includes("TRANSFER") &&
        String(tx.receiverWalletId || tx.receiverWallet?.id) === String(wallet?.walletId));
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] lg:flex">
      <Sidebar
        active={active}
        onNavigate={changeSection}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur md:px-9">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>
            <div>
              <p className="text-sm text-slate-500">Workspace / Overview</p>
              <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadDashboard(page)}
              disabled={loading}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
              title="Refresh dashboard"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button
            onClick={() => navigate("/profile")}
            title="Profile and settings"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700 transition hover:ring-4 hover:ring-emerald-100"
            >
            VP
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-7 p-5 md:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome to VaultPay
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Here's what's happening with your wallet.
              </p>
            </div>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {error && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span>{error}</span>
              <button onClick={() => loadDashboard(page)} className="font-semibold underline">
                Try again
              </button>
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
            <section className="relative overflow-hidden rounded-2xl bg-[#101c2c] p-7 text-white shadow-lg md:p-9">
              <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[35px] border-emerald-400/10" />
              <div className="absolute -bottom-32 right-28 h-64 w-64 rounded-full border-[35px] border-emerald-400/10" />

              <div className="relative">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Wallet size={18} className="text-emerald-400" />
                  Available wallet balance
                </div>

                <div className="mt-5">
                  {loading && !wallet ? (
                    <div className="h-12 w-56 animate-pulse rounded-lg bg-white/10" />
                  ) : (
                    <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                      {money(wallet?.balance)}
                    </h2>
                  )}
                </div>

                <p className="mt-3 text-sm text-slate-400">
                  Wallet ID: {wallet?.walletId ?? "—"}
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <button
                    onClick={() => openAction("deposit")}
                    disabled={!wallet}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    <Plus size={18} /> Add money
                  </button>
                  <button
                    onClick={() => openAction("withdraw")}
                    disabled={!wallet}
                    className="flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                  >
                    <ArrowUpRight size={18} /> Withdraw
                  </button>
                  <button
                    onClick={() => openAction("transfer")}
                    disabled={!wallet}
                    className="flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                  >
                    <Send size={17} /> Transfer
                  </button>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <ArrowDownLeft size={21} />
                </div>
                <p className="text-sm text-slate-500">Deposits on this page</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {transactionCounts.deposits}
                </h3>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 inline-flex rounded-xl bg-orange-50 p-3 text-orange-600">
                  <ArrowUpRight size={21} />
                </div>
                <p className="text-sm text-slate-500">Withdrawals on this page</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {transactionCounts.withdrawals}
                </h3>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
                  <ArrowLeftRight size={21} />
                </div>
                <p className="text-sm text-slate-500">Transfers on this page</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {transactionCounts.transfers}
                </h3>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 inline-flex rounded-xl bg-violet-50 p-3 text-violet-600">
                  <History size={21} />
                </div>
                <p className="text-sm text-slate-500">Total transactions</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {totalElements}
                </h3>
              </div>
            </section>
          </div>

          <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Transaction activity</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Amounts from the currently loaded transactions
                  </p>
                </div>
                <TrendingUp className="text-emerald-600" size={21} />
              </div>

              {chartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#eef2f7" vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value) => money(value)} />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#059669"
                        strokeWidth={2.5}
                        fill="url(#activityFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <TrendingUp size={30} className="text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No transaction activity yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Your activity chart will appear here.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900">Quick actions</h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage your wallet
              </p>

              <div className="mt-6 space-y-3">
                {[
                  { label: "Add money", description: "Deposit into your wallet", action: "deposit", icon: Plus, color: "text-emerald-600 bg-emerald-50" },
                  { label: "Withdraw", description: "Move money out of your wallet", action: "withdraw", icon: ArrowUpRight, color: "text-orange-600 bg-orange-50" },
                  { label: "Send money", description: "Transfer to another wallet", action: "transfer", icon: Send, color: "text-blue-600 bg-blue-50" },
                ].map(({ label, description, action, icon: Icon, color }) => (
                  <button
                    key={action}
                    onClick={() => openAction(action)}
                    disabled={!wallet}
                    className="flex w-full items-center gap-4 rounded-xl border border-slate-100 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40 disabled:opacity-50"
                  >
                    <span className={`rounded-xl p-3 ${color}`}>
                      <Icon size={20} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-slate-800">{label}</span>
                      <span className="mt-1 block text-xs text-slate-500">{description}</span>
                    </span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section id="transaction-section" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-6">
              <div>
                <h3 className="font-bold text-slate-900">Recent transactions</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Your latest wallet activity
                </p>
              </div>
              <button
                onClick={() => {
                  setPage(0);
                  setActive("transactions");
                }}
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Latest page
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
                <LoaderCircle className="animate-spin" size={20} />
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <CircleDollarSign className="mx-auto text-slate-300" size={34} />
                <p className="mt-3 font-semibold text-slate-700">No transactions yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Deposit or transfer money to see activity here.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Transaction</th>
                        <th className="px-6 py-4 font-semibold">Date</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 text-right font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((tx, index) => {
                        const Icon = getTransactionIcon(tx);
                        const credit = isCredit(tx);
                        const date = getTransactionDate(tx);
                        const status = String(tx.status || "UNKNOWN").toUpperCase();

                        return (
                          <tr key={tx.id ?? tx.transactionId ?? index} className="hover:bg-slate-50/70">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className={`rounded-xl p-2.5 ${credit ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}>
                                  <Icon size={18} />
                                </span>
                                <span>
                                    <span className="block text-sm font-semibold text-slate-800">
                                        {getTransactionLabel(tx)}
                                    </span>

                                    <span className="mt-1 block text-xs text-slate-500">
                                        {getCounterpartyLabel(tx)}
                                    </span>
                                    </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {date ? new Date(date).toLocaleString("en-IN") : "—"}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                status === "SUCCESS"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : status === "FAILED"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className={`px-6 py-4 text-right text-sm font-bold ${credit ? "text-emerald-600" : "text-slate-800"}`}>
                              {credit ? "+" : "−"}{money(getTransactionAmount(tx))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                  <p className="text-sm text-slate-500">
                    Page {page + 1} of {Math.max(totalPages, 1)} · {totalElements} transactions
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      disabled={page + 1 >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>

          <footer className="pb-3 text-center text-xs text-slate-400">
            VaultPay · Secure wallet management
          </footer>
        </div>
      </main>

      {modal && wallet && (
        <ActionModal
          action={modal}
          walletId={wallet.walletId}
          onClose={() => setModal(null)}
          onSuccess={() => loadDashboard(page)}
        />
      )}
    </div>
  );
}
