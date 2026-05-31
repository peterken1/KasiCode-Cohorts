'use client'
import { useState } from 'react'
import { createDeal } from '@/app/(dashboard)/deals/actions'

const STAGES = ['lead', 'qualified', 'proposal', 'won', 'lost']

export default function DealForm({ contactId }: { contactId: string }) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const createDealForContact = createDeal.bind(null, contactId)

  async function handleSubmit(formData: FormData) {
    setLoading(true); setError(null)
    try {
      await createDealForContact(formData)
      setOpen(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
        + Add deal
      </button>
    )
  }

  return (
    <form action={handleSubmit}
      className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input name="title" placeholder="Deal title *" required
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div className="grid grid-cols-2 gap-3">
        <input name="value" type="number" placeholder="Value (R)"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select name="stage"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500">
          {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <textarea name="description" placeholder="Description (optional)" rows={2}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none
                   focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium
                     hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? 'Adding…' : 'Add deal'}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="text-sm text-gray-500 px-3 py-1.5 hover:text-gray-700">
          Cancel
        </button>
      </div>
    </form>
  )
}
