import { useState } from 'react'

/**
 * Format inline markdown tokens (bold, italics, inline code)
 */
function renderInlineMarkdown(text) {
  if (!text) return ''

  // Split by inline code tokens `...`
  const codeParts = text.split(/(`[^`]+`)/g)

  return codeParts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={idx}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-900 border border-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    // Process bold **...**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g)
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length >= 4) {
        return (
          <strong key={`${idx}-${bIdx}`} className="font-semibold text-slate-950">
            {bPart.slice(2, -2)}
          </strong>
        )
      }

      // Process italic *...*
      const italicParts = bPart.split(/(\*[^*]+\*)/g)
      return italicParts.map((iPart, iIdx) => {
        if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length >= 2) {
          return (
            <em key={`${idx}-${bIdx}-${iIdx}`} className="italic text-slate-800">
              {iPart.slice(1, -1)}
            </em>
          )
        }
        return iPart
      })
    })
  })
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-1.5 text-xs">
        <span className="font-mono text-slate-400 uppercase tracking-wider">{language || 'Code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          {copied ? '✓ Copied' : 'Copy Code'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs sm:text-sm font-mono leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  )
}

/**
 * Pure React sanitized Markdown renderer
 */
export function MarkdownContent({ content }) {
  if (!content) return null

  const lines = content.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // 1. Code Block ```
    if (line.trim().startsWith('```')) {
      const language = line.trim().replace(/^```/, '').trim()
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <CodeBlock
          key={`code-${i}`}
          code={codeLines.join('\n')}
          language={language}
        />
      )
      i++
      continue
    }

    // 2. Table (| header | header |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }

      if (tableLines.length >= 2) {
        const headerRow = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((cell) => cell.trim())
        
        // Skip separator row (e.g. |---|---|)
        const dataRows = tableLines.slice(2).map((row) =>
          row
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim())
        )

        elements.push(
          <div key={`table-${i}`} className="my-5 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-900 font-semibold">
                <tr>
                  {headerRow.map((h, hIdx) => (
                    <th key={hIdx} className="px-4 py-2.5 font-semibold text-slate-900">
                      {renderInlineMarkdown(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataRows.map((r, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                    {r.map((c, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 text-slate-700">
                        {renderInlineMarkdown(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        continue
      }
    }

    // 3. Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="mt-6 mb-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 border-b border-slate-200 pb-2">
          {renderInlineMarkdown(line.replace(/^#\s+/, ''))}
        </h1>
      )
      i++
      continue
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="mt-5 mb-2.5 text-lg sm:text-xl font-semibold tracking-tight text-slate-950">
          {renderInlineMarkdown(line.replace(/^##\s+/, ''))}
        </h2>
      )
      i++
      continue
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="mt-4 mb-2 text-base sm:text-lg font-semibold text-slate-900">
          {renderInlineMarkdown(line.replace(/^###\s+/, ''))}
        </h3>
      )
      i++
      continue
    }

    // 4. Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={`hr-${i}`} className="my-6 border-slate-200" />)
      i++
      continue
    }

    // 5. Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${i}`} className="my-3 border-l-4 border-slate-900 bg-slate-50 px-4 py-2 text-sm italic text-slate-700">
          {renderInlineMarkdown(line.replace(/^>\s+/, ''))}
        </blockquote>
      )
      i++
      continue
    }

    // 6. Unordered List Items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const listItems = []
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-3 list-disc pl-5 space-y-1 text-sm text-slate-700 leading-relaxed">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      )
      continue
    }

    // 7. Numbered List Items
    if (/^\d+\.\s/.test(line.trim())) {
      const numItems = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        numItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-3 list-decimal pl-5 space-y-1 text-sm text-slate-700 leading-relaxed">
          {numItems.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>
      )
      continue
    }

    // 8. Paragraphs
    if (line.trim().length > 0) {
      elements.push(
        <p key={`p-${i}`} className="my-2.5 text-sm sm:text-base leading-relaxed text-slate-700">
          {renderInlineMarkdown(line)}
        </p>
      )
    }

    i++
  }

  return <div className="markdown-prose space-y-1">{elements}</div>
}

export default MarkdownContent
