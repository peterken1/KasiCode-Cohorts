type Activity = {
  id: string; type: string; description: string; created_at: string
  metadata?: Record<string, any>
}

const ICONS: Record<string, string> = {
  contact_created: '👤', contact_updated: '✏️',
  deal_created: '💼', deal_updated: '🔄', deal_stage_changed: '📊',
  note_added: '📝',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (!activities.length) return <p className="text-sm text-gray-400">No activity yet.</p>

  return (
    <div className="relative">
      <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-100" />
      <div className="space-y-4">
        {activities.map(a => (
          <div key={a.id} className="flex gap-3 relative">
            <div className="w-7 h-7 rounded-full bg-white border border-gray-200
                            flex items-center justify-center flex-shrink-0 z-10 text-sm">
              {ICONS[a.type] ?? '•'}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm text-gray-900">{a.description}</p>
              <p className="text-xs text-gray-400 mt-0.5">{fmt(a.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
