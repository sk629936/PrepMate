import { useState, useEffect } from 'react'
import OTPInput from '../components/auth/OTPInput'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function VerifyOTP() {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('resetEmail')
    if (!storedEmail) {
      // If no email in session, redirect back to forgot-password
      window.location.href = '/forgot-password'
      return
    }
    setEmail(storedEmail)
  }, [])

  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const handleOTPChange = (nextDigits) => {
    setDigits(nextDigits)
    if (error) setError('')
    if (serverError) setServerError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setServerError('')

    const fullCode = digits.join('')
    if (fullCode.length < 6) {
      setError('Enter the 6-digit verification code.')
      return
    }

    if (isLoading) return
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: fullCode,
        }),
      })

      const data = await response.json()

      if (response.status === 200 && data.success) {
        // Save resetToken authorization in sessionStorage for Sub-Module 11
        if (data.resetToken) {
          sessionStorage.setItem('resetToken', data.resetToken)
        }
        window.location.href = '/reset-password'
        return
      }

      if (response.status === 429) {
        setServerError(data.message || 'Too many attempts. Please request a new code.')
        return
      }

      if (response.status === 400) {
        setError(data.message || 'Invalid verification code.')
        return
      }

      setServerError('Something went wrong. Please try again.')
    } catch {
      setServerError('Unable to connect to the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || isResending) return
    setIsResending(true)
    setError('')
    setServerError('')
    setSuccessMessage('')

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.status === 200 && data.success) {
        setSuccessMessage('A new verification code has been sent.')
        setCountdown(60)
        setDigits(['', '', '', '', '', ''])
      } else if (response.status === 429) {
        setServerError(data.message || 'Please wait before requesting another code.')
      } else {
        setServerError(data.message || 'Failed to resend code. Please try again.')
      }
    } catch {
      setServerError('Unable to connect to the server. Please try again.')
    } finally {
      setIsResending(false)
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
            <p className="text-xs font-semibold uppercase tracking-[0.03em] text-slate-950">PASSWORD RESET</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate- xl:text-5xl">Verify your identity</h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-slate-600">Enter the verification code to continue with your password reset process securely.</p>
            <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
              <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
              Secure password reset flow
            </div>
          </div>
          <p className="text-xs text-slate-400">Built for consistent placement preparation.</p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12" aria-labelledby="verify-otp-heading">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 lg:hidden">
              <a href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white" aria-hidden="true">P</span>
                PrepMate
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">PASSWORD RESET</p>
              <h1 id="verify-otp-heading" className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-slate-950">Enter verification code</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Enter the 6-digit code sent to <span className="font-medium text-slate-900">{email || 'your email'}</span>.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
              {serverError && (
                <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              {successMessage && (
                <div role="status" className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
                  {successMessage}
                </div>
              )}

              <div>
                <OTPInput value={digits} onChange={handleOTPChange} error={error} autoFocus />
                {error && <p id="otp-error" className="mt-2.5 text-center text-xs text-red-600" role="alert">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Verifying code...' : 'Verify Code'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              <p>
                Didn&apos;t receive a code?{' '}
                {countdown > 0 ? (
                  <span className="font-medium text-slate-400">Resend OTP in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    disabled={isResending}
                    onClick={handleResend}
                    className="font-semibold text-slate-950 transition-colors duration-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isResending ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </p>
            </div>

            <div className="mt-7 space-y-3 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
              <p>
                <a href="/forgot-password" className="font-semibold text-slate-950 transition-colors duration-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2">
                  Back to Forgot Password
                </a>
              </p>
              <p>
                <a href="/login" className="font-semibold text-slate-950 transition-colors duration-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2">
                  Back to Login
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default VerifyOTP

