export function SubmitInterviewModal({ isOpen, isSubmitting, onCancel, onConfirm }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl border border-slate-200 shadow-lg max-w-sm w-full p-5 sm:p-6 space-y-4 animate-[fadeIn_150ms_ease-out]">
        {/* Icon */}
        <div className="flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-1.5">
          <h3 className="text-base font-bold text-slate-950">Submit interview?</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            You won't be able to change your answers after submission.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Submitting...
              </span>
            ) : (
              'Submit Interview'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubmitInterviewModal
