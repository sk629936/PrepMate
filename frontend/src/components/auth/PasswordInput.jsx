import { useState } from 'react'

function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17.3 17.3 0 0 1-3 3.8M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1.4 0 2.7-.3 3.8-.8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  )
}

function PasswordInput({ id, value, onChange, error, name = 'password', placeholder = 'Enter your password', autoComplete = 'current-password' }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`min-h-11 w-full rounded-md border bg-white px-3.5 pr-12 text-sm text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 ${error ? 'border-red-400' : 'border-slate-300'}`}
        />
        <button
          type="button"
          className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition duration-200 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
        >
          <EyeIcon visible={isVisible} />
        </button>
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  )
}

export default PasswordInput
