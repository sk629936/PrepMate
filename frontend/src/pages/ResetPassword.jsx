import { useState, useEffect } from 'react'
import PasswordInput from '../components/auth/PasswordInput'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function ResetPassword() {
  const [resetToken, setResetToken] = useState(null)
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [succeeded, setSucceeded] = useState(false)

  // ── Guard: redirect to /forgot-password if no resetToken in session ────────
  useEffect(() => {
    const stored = sessionStorage.getItem('resetToken')
    if (!stored) {
      window.location.href = '/forgot-password'
    } else {
      setResetToken(stored)
    }
  }, [])

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
    if (apiError) setApiError(null)
  }

  const validate = () => {
    const nextErrors = {}

    if (!form.password) {
      nextErrors.password = 'Enter your new password.'
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your new password.'
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsLoading(true)
    setApiError(null)

    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken,
          newPassword: form.password,
          // confirmPassword is NEVER sent to the backend
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // ── Clean up all password-reset session data ──────────────────────
        sessionStorage.removeItem('resetToken')
        sessionStorage.removeItem('resetEmail')
        setSucceeded(true)
      } else {
        setApiError(
          data.message || 'Something went wrong. Please try again.'
        )
      }
    } catch {
      setApiError('Unable to connect to the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">PASSWORD RESET</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-950 xl:text-5xl">Create a new password</h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-slate-600">Choose a strong, secure password for your PrepMate account to keep your preparation progress safe.</p>
            <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
              <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
              Secure your account
            </div>
          </div>
          <p className="text-xs text-slate-400">Built for consistent placement preparation.</p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12" aria-labelledby="reset-password-heading">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 lg:hidden">
              <a href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white" aria-hidden="true">P</span>
                PrepMate
              </a>
            </div>
            {succeeded ? (
              /* ── Success State ───────────────────────────────────────────── */
              <div className="py-4 text-center" role="status" aria-live="polite">
                <div
                  className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-50"
                  aria-hidden="true"
                >
                  <svg
                    className="h-7 w-7 text-slate-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                  Password reset successfully
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Your password has been updated. You can now sign in with your new password.
                </p>
                <a
                  href="/login"
                  className="btn-primary mt-8 inline-flex w-full items-center justify-center"
                >
                  Back to Login
                </a>
              </div>
            ) : (
              /* ── Form State ─────────────────────────────────────────────── */
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">PASSWORD RESET</p>
                  <h1 id="reset-password-heading" className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-slate-950">Create a new password</h1>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Choose a new password for your PrepMate account.</p>
                </div>

                {/* API Error Banner */}
                {apiError && (
                  <div
                    className="mt-5 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    role="alert"
                    aria-live="assertive"
                  >
                    {apiError}
                  </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-slate-800">New Password</label>
                    <PasswordInput
                      id="new-password"
                      name="password"
                      value={form.password}
                      onChange={updateField('password')}
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                      error={errors.password}
                      disabled={isLoading}
                    />
                    <p className="mt-1.5 text-xs text-slate-400">Use at least 8 characters.</p>
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-800">Confirm New Password</label>
                    <PasswordInput
                      id="confirm-password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={updateField('confirmPassword')}
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                      error={errors.confirmPassword}
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    {isLoading ? 'Resetting password…' : 'Reset Password'}
                  </button>
                </form>

                <p className="mt-7 text-center text-sm text-slate-500">
                  <a
                    href="/login"
                    className="font-semibold text-slate-950 transition-colors duration-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                  >
                    Back to Login
                  </a>
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default ResetPassword
