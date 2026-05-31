import { Draggable } from '@hello-pangea/dnd'
import Link from 'next/link'
import type { Deal } from '@/app/(dashboard)/deals/page'

function daysAgo(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

export default function DealKanbanCard({ deal, index }: { deal: Deal; index: number }) {
  const days = daysAgo(deal.created_at)

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg border p-3 select-none transition-shadow
            ${snapshot.isDragging
              ? 'shadow-lg border-blue-300 rotate-1'
              : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
            }`}
        >
          <p className="text-sm font-medium text-gray-900 leading-snug mb-1">{deal.title}</p>

          {deal.contacts && (
            <Link
              href={`/contacts/${deal.contact_id}`}
              onClick={e => e.stopPropagation()}
              className="text-xs text-blue-600 hover:underline block mb-2"
            >
              {deal.contacts.first_name} {deal.contacts.last_name}
            </Link>
          )}

          <div className="flex items-center justify-between">
            {deal.value > 0
              ? <span className="text-xs font-semibold text-gray-700">
                  R {Number(deal.value).toLocaleString('en-ZA')}
                </span>
              : <span />
            }
            <span className={`text-xs ${days > 14 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              {days === 0 ? 'Today' : `${days}d`}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  )
}
