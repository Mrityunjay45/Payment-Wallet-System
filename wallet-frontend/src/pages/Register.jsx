import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wallet, User, Mail, LockKeyhole, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Registration failed.'
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
            START YOUR FINANCIAL JOURNEY
          </p>
          <h1 className="text-5xl font-bold leading-tight">
            Banking made
            <br />
            simple.
            <br />
            Payments made
            <br />
            smarter.
          </h1>
          <p className="text-slate-400 mt-6 max-w-md leading-7">
            Create your account and experience a simpler way
            to manage and transfer money.
          </p>
        </div>

        <p className="text-slate-500 text-sm">
          Secure digital wallet management
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Wallet className="text-brand" size={28} />
            <span className="text-2xl font-bold">VaultPay</span>
          </div>

          <p className="text-brand font-semibold text-sm mb-3">
            GET STARTED
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            Create your account
          </h2>

          <p className="text-slate-500 mt-2 mb-8">
            Start managing your money with VaultPay.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-2">Full name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400" size={19} />
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-brand focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={19} />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-brand focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-3.5 text-slate-400" size={19} />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-brand focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                >
                {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-7">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
