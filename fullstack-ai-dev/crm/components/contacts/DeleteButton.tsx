'use client'
import { useState } from 'react'

export default function DeleteButton({ action }: { action: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false)
  const [loading,    setLoading]    = useState(false)

  async function handleDelete() {
    setLoading(true)
    try { await action() }
    catch { setLoading(false); setConfirming(false) }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Delete?</span>
        <button onClick={handleDelete} disabled={loading}
          className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg
                     hover:bg-red-700 disabled:opacity-50 transition-colors">
          {loading ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button onClick={() => setConfirming(false)}
          className="text-sm text-gray-500 px-2 py-1.5 hover:text-gray-700">
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirming(true)}
      className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg
                 text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors">
      Delete
    </button>
  )
}
