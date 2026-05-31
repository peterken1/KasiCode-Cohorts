'use client'
import { useState } from 'react'
import { addNote } from '@/app/(dashboard)/deals/actions'

export default function NoteForm({ contactId }: { contactId: string }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const addNoteForContact = addNote.bind(null, contactId)

  async function handleSubmit(formData: FormData) {
    setLoading(true); setError(null)
    try {
      await addNoteForContact(formData)
      const form = document.getElementById('note-form') as HTMLFormElement
      form?.reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form id="note-form" action={handleSubmit} className="mb-4">
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <textarea name="content" rows={3} placeholder="Write a note…"
        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900
                   focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      <div className="flex justify-end mt-2">
        <button type="submit" disabled={loading}
          className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium
                     hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {loading ? 'Saving…' : 'Add note'}
        </button>
      </div>
    </form>
  )
}
