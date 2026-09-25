import { useState } from 'react'
import PasswordInput from '../components/auth/PasswordInput'

// Backend base URL — configured in frontend/.env, never hardcoded
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Signup() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
    if (serverError) setServerError('')
  }

  const validate = () => {
    const nextErrors = {}

    if (form.fullName.trim().length < 2) {
      nextErrors.fullName = 'Enter your full name.'
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Enter your email.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!form.password) {
      nextErrors.password = 'Create a password.'
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password.'
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')

    // 1. Run frontend validation first
    const frontendErrors = validate()
    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors)
      return
    }

    // 2. Prevent duplicate submissions while request is in flight
    if (isLoading) return
    setIsLoading(true)

    try {
      // 3. Send only the three required fields — confirmPassword is NEVER sent
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      })

      const data = await response.json()

      if (response.status === 201 && data.success) {
        // Success — show clean success state
        setIsSuccess(true)
        return
      }

      if (response.status === 409) {
        // Duplicate email — show inline on the email field
        setErrors({ email: data.message || 'An account with this email already exists.' })
        return
      }

      if (response.status === 400) {
        // Backend validation error
        setServerError(data.message || 'Please check your inputs and try again.')
        return
      }

      // Unexpected non-200 status
      setServerError('Something went wrong. Please try again.')
    } catch {
      // Network failure — never expose raw fetch error
      setServerError('Unable to connect to the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (isSuccess) {
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
              <p className="mt-5 max-w-sm text-base leading-7 text-slate-600">Create a focused routine for practice, testing and steady progress toward your placement goals.</p>
              <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
                Build skills across DSA, aptitude, Core CS and interviews
              </div>
            </div>
            <p className="text-xs text-slate-400">Built for consistent placement preparation.</p>
          </section>

          <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12" aria-labelledby="signup-success-heading">
            <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-8 lg:hidden">
                <a href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white" aria-hidden="true">P</span>
                  PrepMate
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">PREPMATE ACCOUNT</p>
                <h1 id="signup-success-heading" className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-slate-950">Account created!</h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">Account created successfully. You can now log in to start your placement preparation journey.</p>
              </div>
              <div className="mt-8">
                <a
                  href="/login"
                  className="btn-primary w-full flex items-center justify-center"
                >
                  Go to Login
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    )
  }

  // ── Main signup form ───────────────────────────────────────────────────────
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
            <p className="mt-5 max-w-sm text-base leading-7 text-slate-600">Create a focused routine for practice, testing and steady progress toward your placement goals.</p>
            <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
              <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
              Build skills across DSA, aptitude, Core CS and interviews
            </div>
          </div>
          <p className="text-xs text-slate-400">Built for consistent placement preparation.</p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12" aria-labelledby="signup-heading">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 lg:hidden">
              <a href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white" aria-hidden="true">P</span>
                PrepMate
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">PREPMATE ACCOUNT</p>
              <h1 id="signup-heading" className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-slate-950">Create your account</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">Start building your placement preparation journey.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              {/* Server-level error banner (400 / 500 / network) */}
              {serverError && (
                <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <div>
                <label htmlFor="full-name" className="mb-2 block text-sm font-medium text-slate-800">Full Name</label>
                <input id="full-name" name="fullName" type="text" value={form.fullName} onChange={updateField('fullName')} placeholder="Enter your full name" autoComplete="name" aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'full-name-error' : undefined} className={`min-h-11 w-full rounded-md border bg-white px-3.5 text-sm text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 ${errors.fullName ? 'border-red-400' : 'border-slate-300'}`} />
                {errors.fullName && <p id="full-name-error" className="mt-1.5 text-xs text-red-600" role="alert">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-slate-800">Email</label>
                <input id="signup-email" name="email" type="email" value={form.email} onChange={updateField('email')} placeholder="Enter your email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'signup-email-error' : undefined} className={`min-h-11 w-full rounded-md border bg-white px-3.5 text-sm text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 ${errors.email ? 'border-red-400' : 'border-slate-300'}`} />
                {errors.email && <p id="signup-email-error" className="mt-1.5 text-xs text-red-600" role="alert">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-slate-800">Password</label>
                <PasswordInput id="signup-password" name="password" value={form.password} onChange={updateField('password')} placeholder="Create a password" autoComplete="new-password" error={errors.password} />
                <p className="mt-1.5 text-xs text-slate-400">Use at least 8 characters.</p>
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-800">Confirm Password</label>
                <PasswordInput id="confirm-password" name="confirmPassword" value={form.confirmPassword} onChange={updateField('confirmPassword')} placeholder="Confirm your password" autoComplete="new-password" error={errors.confirmPassword} />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
              By creating an account, you agree to our{' '}
              <button type="button" className="font-medium text-slate-800 transition-colors duration-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2" onClick={(event) => event.preventDefault()}>Terms</button>{' '}
              and{' '}
              <button type="button" className="font-medium text-slate-800 transition-colors duration-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2" onClick={(event) => event.preventDefault()}>Privacy Policy</button>.
            </p>
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-slate-950 transition-colors duration-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2">Log in</a>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Signup
