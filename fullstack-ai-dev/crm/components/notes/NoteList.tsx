import { deleteNote } from '@/app/(dashboard)/deals/actions'

type Note = { id: string; content: string; created_at: string }

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function NoteList({ notes, contactId }: { notes: Note[]; contactId: string }) {
  if (!notes.length) return <p className="text-sm text-gray-400">No notes yet.</p>

  return (
    <div className="space-y-3">
      {notes.map(note => {
        const deleteWithIds = deleteNote.bind(null, note.id, contactId)
        return (
          <div key={note.id}
            className="bg-white border border-gray-200 rounded-xl p-4 group">
            <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
              {note.content}
            </p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">{fmt(note.created_at)}</span>
              <form action={deleteWithIds}
                className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="submit"
                  className="text-xs text-red-400 hover:text-red-600">
                  Delete
                </button>
              </form>
            </div>
          </div>
        )
      })}
    </div>
  )
}
