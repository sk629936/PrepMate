import { useCallback } from 'react'

export function AnswerEditor({
  questionId,
  answer = '',
  onChangeAnswer,
  onSave,
  isSaving,
  saveStatus,
}) {
  const handleChange = useCallback(
    (e) => {
      if (onChangeAnswer) {
        onChangeAnswer(e.target.value)
      }
    },
    [onChangeAnswer]
  )

  const handleSave = useCallback(() => {
    if (onSave && !isSaving) {
      onSave(questionId, answer)
    }
  }, [onSave, questionId, answer, isSaving])

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0
  const charCount = answer.length

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor={`answer-${questionId}`}
          className="text-xs font-bold text-slate-950"
        >
          Your Answer
        </label>

        {/* Save status */}
        {saveStatus && (
          <span className="text-2xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded transition-opacity duration-200">
            {saveStatus}
          </span>
        )}
      </div>

      <textarea
        id={`answer-${questionId}`}
        value={answer}
        onChange={handleChange}
        rows={8}
        placeholder="Type your answer here..."
        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-y min-h-[160px] max-h-[400px] transition-colors duration-150 hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:outline-none"
      />

      <div className="flex items-center justify-between">
        <span className="text-2xs text-slate-500 font-medium">
          {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} chars
        </span>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-95 cursor-pointer"
        >
          {isSaving ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
              Saving...
            </span>
          ) : (
            'Save Answer'
          )}
        </button>
      </div>
    </div>
  )
}

AnswerEditor.displayName = 'AnswerEditor'

export default AnswerEditor

