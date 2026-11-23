
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wallet, User, Mail, LockKeyhole, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Login failed. Check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">

      <div className="hidden lg:flex flex-col justify-between bg-sidebar p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand p-3">
            <Wallet size={25} />
          </div>
          <span className="text-2xl font-bold">VaultPay</span>
        </div>

        <div>
          <p className="text-brand font-semibold mb-4">
            SMARTER MONEY MANAGEMENT
          </p>
          <h1 className="text-5xl font-bold leading-tight">
            Your money.
            <br />
            Your control.
            <br />
            Your future.
          </h1>
          <p className="text-slate-400 mt-6 max-w-md leading-7">
            Manage your wallet, transfer money securely and
            track every transaction from one simple dashboard.
          </p>
        </div>

        <p className="text-slate-500 text-sm">
          Secure digital wallet management
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <div className="lg:hidden flex items-center gap-2 mb-12">
            <Wallet className="text-brand" size={28} />
            <span className="text-2xl font-bold">VaultPay</span>
          </div>

          <p className="text-brand font-semibold text-sm mb-3">
            WELCOME BACK
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            Sign in to your account
          </h2>

          <p className="text-slate-500 mt-2 mb-8">
            Enter your credentials to access your wallet.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={19} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-brand focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>

              <div className="relative">
                <LockKeyhole className="absolute left-4 top-3.5 text-slate-400" size={19} />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-12 outline-none focus:border-brand focus:ring-2 focus:ring-green-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                >
                {loading ? "Signing in..." : "Sign In"}
                </button>

          </form>

          <p className="text-center text-sm text-slate-500 mt-7">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand hover:underline">
              Create account
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
