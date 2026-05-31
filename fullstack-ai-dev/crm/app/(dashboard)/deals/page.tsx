import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import KanbanBoard from '@/components/pipeline/KanbanBoard'

export const STAGES = [
  { id: 'lead',      label: 'Lead',      colour: 'gray'   },
  { id: 'qualified', label: 'Qualified', colour: 'blue'   },
  { id: 'proposal',  label: 'Proposal',  colour: 'yellow' },
  { id: 'won',       label: 'Won',       colour: 'green'  },
  { id: 'lost',      label: 'Lost',      colour: 'red'    },
] as const

export type Stage = typeof STAGES[number]['id']

export type Deal = {
  id: string; title: string; value: number; stage: Stage
  contact_id: string; created_at: string
  contacts: { first_name: string; last_name: string } | null
}

export default async function DealsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: deals, error } = await supabase
    .from('deals')
    .select('*, contacts(first_name, last_name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return <div className="p-8 text-red-600">Failed to load pipeline.</div>

  const columns = STAGES.reduce((acc, stage) => {
    acc[stage.id] = (deals ?? []).filter(d => d.stage === stage.id) as Deal[]
    return acc
  }, {} as Record<Stage, Deal[]>)

  const totalPipeline = (deals ?? [])
    .filter(d => d.stage !== 'won' && d.stage !== 'lost')
    .reduce((s, d) => s + Number(d.value), 0)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {deals?.length ?? 0} deal{deals?.length !== 1 ? 's' : ''}
          {totalPipeline > 0 && ` · R ${totalPipeline.toLocaleString('en-ZA')} open pipeline`}
        </p>
      </div>
      <KanbanBoard initialColumns={columns} stages={STAGES} />
    </div>
  )
}
