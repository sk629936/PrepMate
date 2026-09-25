import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setServerError('')

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Enter your email.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    if (isLoading) return
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      })

      const data = await response.json()

      if (response.status === 200 && data.success) {
        // Save email in sessionStorage for verify-otp page
        sessionStorage.setItem('resetEmail', trimmedEmail)
        window.location.href = '/verify-otp'
        return
      }

      if (response.status === 429) {
        setServerError(data.message || 'Please wait before requesting another code.')
        return
      }

      if (response.status === 400) {
        setServerError(data.message || 'Please check your email and try again.')
        return
      }

      setServerError('Something went wrong. Please try again.')
    } catch {
      setServerError('Unable to connect to the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateEmail = (event) => {
    setEmail(event.target.value)
    if (error) setError('')
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
            <p className="mt-5 max-w-sm text-base leading-7 text-slate-600">Keep your placement preparation focused, organized and ready whenever you are.</p>
            <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
              <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
              A clear path back to your preparation
            </div>
          </div>
          <p className="text-xs text-slate-400">Built for consistent placement preparation.</p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12" aria-labelledby="forgot-password-heading">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 lg:hidden">
              <a href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white" aria-hidden="true">P</span>
                PrepMate
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">PREPMATE ACCOUNT</p>
              <h1 id="forgot-password-heading" className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-slate-950">Forgot your password?</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">Enter your email address and we&apos;ll help you reset your password.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              {serverError && (
                <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <div>
                <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium text-slate-800">Email</label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={updateEmail}
                  placeholder="Enter your email"
                  autoComplete="email"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'forgot-email-error' : undefined}
                  className={`min-h-11 w-full rounded-md border bg-white px-3.5 text-sm text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 ${error ? 'border-red-400' : 'border-slate-300'}`}
                />
                {error && <p id="forgot-email-error" className="mt-1.5 text-xs text-red-600" role="alert">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            <div className="mt-7 space-y-3 text-center text-sm text-slate-500">
              <p>
                Remember your password?{' '}
                <a href="/login" className="font-semibold text-slate-950 transition-colors duration-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2">Back to Login</a>
              </p>
              <p>
                Don&apos;t have an account?{' '}
                <a href="/signup" className="font-semibold text-slate-950 transition-colors duration-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2">Create an account</a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ForgotPassword

