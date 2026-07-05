import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const initialState = { email: '', password: '', otp: '' }

export default function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const mode = location.pathname.includes('/register') ? 'register' : 'login'
  const { register, verifyEmail, login, forgotPassword, loading } = useAuth()
  const [form, setForm] = useState(initialState)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [verificationStep, setVerificationStep] = useState(false)

  const heading = useMemo(() => mode === 'register' ? 'Create an account' : 'Welcome back', [mode])
  const subheading = useMemo(() => mode === 'register'
    ? 'Register with your email and password, then verify the OTP sent to your inbox.'
    : 'Sign in to continue shopping and manage your orders.', [mode])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (mode === 'register') {
      try {
        const result = await register({ email: form.email, password: form.password })
        setMessage(result.message)
        setVerificationStep(true)
      } catch (err) {
        setError(typeof err === 'string' ? err : err?.message || 'Registration failed')
      }
      return
    }

    try {
      const result = await login({ email: form.email, password: form.password })
      setMessage(result.message)
      navigate('/')
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Unable to sign in')
    }
  }

  const handleVerify = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      const result = await verifyEmail({ email: form.email, otp: form.otp })
      setMessage(result.message)
      setVerificationStep(false)
      navigate('/login')
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Verification failed')
    }
  }

  const handleForgotPassword = async () => {
    if (!form.email) {
      setError('Enter your email first so we can send the reset OTP.')
      return
    }

    try {
      const result = await forgotPassword({ email: form.email })
      setMessage(result.message)
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to request reset OTP')
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row lg:items-center">
      <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Authentication</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{heading}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{subheading}</p>

        {message ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}
        {error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        {!verificationStep ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">Email address</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" placeholder="you@example.com" />
            </label>

            {mode === 'register' ? (
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1.5 block">Password</span>
                <input type="password" name="password" value={form.password} onChange={handleChange} required minLength="8" className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" placeholder="At least 8 characters" />
              </label>
            ) : (
              <>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1.5 block">Password</span>
                  <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" placeholder="Enter your password" />
                </label>
                <button type="button" onClick={handleForgotPassword} className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline">
                  Forgot password?
                </button>
              </>
            )}

            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Sign in'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">OTP code</span>
              <input name="otp" value={form.otp} onChange={handleChange} required className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" placeholder="Enter 6-digit OTP" />
            </label>
            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? 'Verifying...' : 'Verify email'}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-slate-600">
          {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link to={mode === 'register' ? '/login' : '/register'} className="font-semibold text-slate-900 underline-offset-4 hover:underline">
            {mode === 'register' ? 'Sign in instead' : 'Create one'}
          </Link>
        </p>
      </div>

    </div>
  )
}
