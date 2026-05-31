'use client'
import { useState } from 'react'
import { updateDealStage, deleteDeal } from '@/app/(dashboard)/deals/actions'
import EmailDrafter from '@/components/ai/EmailDrafter'

const STAGES = ['lead', 'qualified', 'proposal', 'won', 'lost'] as const

const STAGE_COLOURS: Record<string, string> = {
  lead:      'bg-gray-100 text-gray-600',
  qualified: 'bg-blue-100 text-blue-700',
  proposal:  'bg-yellow-100 text-yellow-700',
  won:       'bg-green-100 text-green-700',
  lost:      'bg-red-100 text-red-600',
}

export default function DealCard({ deal, contactId }: { deal: any; contactId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleStageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true)
    await updateDealStage(deal.id, contactId, e.target.value)
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${deal.title}"?`)) return
    await deleteDeal(deal.id, contactId)
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-white
                    hover:border-gray-300 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate text-sm">{deal.title}</p>
          {deal.value > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              R {Number(deal.value).toLocaleString('en-ZA')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={deal.stage} onChange={handleStageChange} disabled={loading}
            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer
                        focus:outline-none focus:ring-2 focus:ring-blue-500 ${STAGE_COLOURS[deal.stage]}`}
          >
            {STAGES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button onClick={handleDelete}
            className="text-gray-300 hover:text-red-500 transition-colors text-xl leading-none">
            ×
          </button>
        </div>
      </div>

      {deal.description && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{deal.description}</p>
      )}

      <EmailDrafter dealId={deal.id} />
    </div>
  )
}
