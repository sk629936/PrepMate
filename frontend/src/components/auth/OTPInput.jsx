import { useRef, useEffect } from 'react'

function OTPInput({ value = ['', '', '', '', '', ''], onChange, error, disabled = false, autoFocus = true }) {
  const inputRefs = useRef([])

  // Ensure value is always an array of 6 strings
  const digits = Array.isArray(value)
    ? [...value, '', '', '', '', ''].slice(0, 6)
    : (typeof value === 'string' ? value.split('') : []).concat(['', '', '', '', '', '']).slice(0, 6)

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const focusInput = (index) => {
    const targetIndex = Math.max(0, Math.min(index, 5))
    if (inputRefs.current[targetIndex]) {
      inputRefs.current[targetIndex].focus()
      inputRefs.current[targetIndex].select()
    }
  }

  const handleChange = (index, e) => {
    const val = e.target.value
    // Extract only digits
    const numericVal = val.replace(/\D/g, '')

    if (!numericVal) {
      // Input was cleared
      const nextDigits = [...digits]
      nextDigits[index] = ''
      onChange(nextDigits)
      return
    }

    // Take the last entered character if multiple characters were somehow typed
    const singleDigit = numericVal.slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = singleDigit
    onChange(nextDigits)

    // Auto-focus next input box if available
    if (index < 5) {
      focusInput(index + 1)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        e.preventDefault()
        const nextDigits = [...digits]
        nextDigits[index - 1] = ''
        onChange(nextDigits)
        focusInput(index - 1)
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      if (index > 0) {
        focusInput(index - 1)
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      if (index < 5) {
        focusInput(index + 1)
      }
    }
  }

  const handlePaste = (index, e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const numericData = pastedData.replace(/\D/g, '').slice(0, 6)

    if (numericData.length > 0) {
      const nextDigits = [...digits]
      // Fill starting from position 0 if paste covers whole code, else starting from current box
      const startPos = numericData.length === 6 ? 0 : index
      for (let i = 0; i < numericData.length; i++) {
        if (startPos + i < 6) {
          nextDigits[startPos + i] = numericData[i]
        }
      }
      onChange(nextDigits)
      const nextFocus = Math.min(startPos + numericData.length, 5)
      focusInput(nextFocus)
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          id={`otp-digit-${index}`}
          name={`otp-digit-${index}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          aria-label={`Digit ${index + 1} of 6`}
          aria-invalid={Boolean(error)}
          className={`h-12 w-11 rounded-md border text-center text-lg font-semibold text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 sm:h-12 sm:w-12 ${
            error ? 'border-red-400' : 'border-slate-300'
          }`}
        />
      ))}
    </div>
  )
}

export default OTPInput
