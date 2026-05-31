'use client'
import { useState } from 'react'

export default function EmailDrafter({ dealId }: { dealId: string }) {
  const [draft,   setDraft]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [copied,  setCopied]  = useState(false)

  async function handleDraft() {
    setLoading(true); setDraft(''); setError(null); setCopied(false)
    try {
      const response = await fetch('/api/ai/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId }),
      })
      if (!response.ok) throw new Error('AI request failed')
      if (!response.body) throw new Error('No response body')

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setDraft(prev => prev + decoder.decode(value, { stream: true }))
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
          <span>✉️</span> AI email draft
        </span>
        <div className="flex gap-2 items-center">
          {draft && (
            <button onClick={handleCopy}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          )}
          <button onClick={handleDraft} disabled={loading}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium
                       disabled:opacity-50 transition-colors">
            {loading ? 'Drafting…' : draft ? 'Redraft' : 'Draft email'}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {(draft || loading) && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700
                        whitespace-pre-wrap leading-relaxed font-mono">
          {draft}
          {loading && (
            <span className="inline-block w-1 h-3 bg-gray-400 animate-pulse ml-0.5 rounded-sm" />
          )}
        </div>
      )}
    </div>
  )
}
