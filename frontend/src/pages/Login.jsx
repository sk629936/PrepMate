import { useState } from 'react'
import PasswordInput from '../components/auth/PasswordInput'

// Backend base URL — configured in frontend/.env, never hardcoded
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const nextErrors = {}

    if (!email.trim()) {
      nextErrors.email = 'Enter your email.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!password) {
      nextErrors.password = 'Enter your password.'
    }

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')

    // 1. Frontend validation
    const frontendErrors = validate()
    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors)
      return
    }

    // 2. Prevent duplicate submission while loading
    if (isLoading) return
    setIsLoading(true)

    try {
      // 3. Send request to backend
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (response.status === 200 && data.success) {
        // Store JWT token safely for session support
        if (data.token) {
          localStorage.setItem('token', data.token)
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }

        // Navigate to dashboard placeholder
        window.location.href = '/dashboard'
        return
      }

      if (response.status === 401) {
        setServerError(data.message || 'Invalid email or password.')
        return
      }

      if (response.status === 400) {
        setServerError(data.message || 'Please check your inputs and try again.')
        return
      }

      setServerError('Something went wrong. Please try again.')
    } catch {
      // Graceful network error handling
      setServerError('Unable to connect to the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateEmail = (event) => {
    setEmail(event.target.value)
    if (errors.email) setErrors((current) => ({ ...current, email: undefined }))
    if (serverError) setServerError('')
  }

  const updatePassword = (event) => {
    setPassword(event.target.value)
    if (errors.password) setErrors((current) => ({ ...current, password: undefined }))
    if (serverError) setServerError('')
  }

  return (
    <main className="min-h-screen bg-slate-50/60">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1fr_0.85fr]">
        <section className="hidden flex-col justify-between border-r border-slate-200 bg-white px-10 py-10 lg:flex xl:px-16" aria-label="PrepMate introduction">
          <a href="/" className="inline-flex w-fit items-center gap-2 text-lg font-semibold tracking-tight text-slate-950 transition-colors duration-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white" aria-hidden="true">P</span>
            PrepMate
          </a>
          <div className="max-w-md pb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">PLACEMENT PREPARATION PLATFORM</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-950 xl:text-5xl">Prepare smarter. Get placement ready.</h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-slate-600">A focused place to practice, test your knowledge and build the confidence for your next placement opportunity.</p>
            <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
              <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
              DSA, aptitude, Core CS and interview preparation
            </div>
          </div>
          <p className="text-xs text-slate-400">Built for consistent placement preparation.</p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12" aria-labelledby="login-heading">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 lg:hidden">
              <a href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white" aria-hidden="true">P</span>
                PrepMate
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">PREPMATE ACCOUNT</p>
              <h1 id="login-heading" className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-slate-950">Welcome back</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">Log in to continue your placement preparation.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              {/* Server-level error banner (401 / 400 / 500 / network) */}
              {serverError && (
                <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-800">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={updateEmail}
                  placeholder="Enter your email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`min-h-11 w-full rounded-md border bg-white px-3.5 text-sm text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 ${errors.email ? 'border-red-400' : 'border-slate-300'}`}
                />
                {errors.email && <p id="email-error" className="mt-1.5 text-xs text-red-600" role="alert">{errors.email}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-800">Password</label>
                  <a href="/forgot-password" className="text-xs font-medium text-slate-500 transition-colors duration-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2">Forgot password?</a>
                </div>
                <PasswordInput id="password" value={password} onChange={updatePassword} error={errors.password} />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Signing in...' : 'Log In'}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="font-semibold text-slate-950 transition-colors duration-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2">Create an account</a>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Login

