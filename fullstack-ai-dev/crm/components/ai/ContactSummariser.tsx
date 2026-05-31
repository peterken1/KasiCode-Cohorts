'use client'
import { useState } from 'react'

export default function ContactSummariser({ contactId }: { contactId: string }) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSummarise() {
    setLoading(true); setSummary(''); setError(null)
    try {
      const response = await fetch('/api/ai/summarise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId }),
      })
      if (!response.ok) throw new Error('AI request failed')
      if (!response.body) throw new Error('No response body')

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setSummary(prev => prev + decoder.decode(value, { stream: true }))
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-teal-200 rounded-xl bg-teal-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">✨</span>
          <h3 className="text-sm font-semibold text-teal-900">AI Briefing</h3>
        </div>
        <button
          onClick={handleSummarise} disabled={loading}
          className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg font-medium
                     hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Generating…' : summary ? 'Regenerate' : 'Summarise'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {(summary || loading) && (
        <div className="text-sm text-teal-900 leading-relaxed whitespace-pre-wrap">
          {summary}
          {loading && (
            <span className="inline-block w-1.5 h-4 bg-teal-400 animate-pulse ml-0.5 rounded-sm" />
          )}
        </div>
      )}

      {!summary && !loading && !error && (
        <p className="text-xs text-teal-600">
          Click Summarise to get an AI briefing on this contact based on their deals, notes, and activity.
        </p>
      )}
    </div>
  )
}
