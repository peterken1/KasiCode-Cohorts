import Link from 'next/link'

type Activity = {
  id: string; type: string; description: string; created_at: string
  contact_id: string | null
  contacts?: { first_name: string; last_name: string } | null
}

const ICONS: Record<string, string> = {
  contact_created: '👤', contact_updated: '✏️',
  deal_created: '💼', deal_updated: '🔄', deal_stage_changed: '📊',
  note_added: '📝',
}

function timeAgo(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function RecentActivity({ activities }: { activities: Activity[] }) {
  if (!activities.length) {
    return (
      <p className="text-sm text-gray-400 py-4">
        No activity yet. Add a contact to get started.
      </p>
    )
  }
  return (
    <div className="divide-y divide-gray-100">
      {activities.map(a => (
        <div key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center
                          flex-shrink-0 text-sm">
            {ICONS[a.type] ?? '•'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 truncate">{a.description}</p>
            {a.contacts && a.contact_id && (
              <Link href={`/contacts/${a.contact_id}`}
                className="text-xs text-blue-600 hover:underline">
                {a.contacts.first_name} {a.contacts.last_name}
              </Link>
            )}
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0 pt-0.5">{timeAgo(a.created_at)}</span>
        </div>
      ))}
    </div>
  )
}
