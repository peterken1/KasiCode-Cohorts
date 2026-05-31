import { Droppable } from '@hello-pangea/dnd'
import DealKanbanCard from './DealKanbanCard'
import type { Deal, Stage } from '@/app/(dashboard)/deals/page'

type StageConfig = { id: Stage; label: string; colour: string }

const COL_COLOURS: Record<string, string> = {
  gray:   'border-gray-200   bg-gray-50',
  blue:   'border-blue-200   bg-blue-50',
  yellow: 'border-yellow-200 bg-yellow-50',
  green:  'border-green-200  bg-green-50',
  red:    'border-red-200    bg-red-50',
}
const HDR_COLOURS: Record<string, string> = {
  gray:   'text-gray-600',
  blue:   'text-blue-700',
  yellow: 'text-yellow-700',
  green:  'text-green-700',
  red:    'text-red-600',
}

export default function KanbanColumn({
  stage, deals, isPending,
}: {
  stage: StageConfig; deals: Deal[]; isPending: boolean
}) {
  const totalValue = deals.reduce((s, d) => s + Number(d.value), 0)

  return (
    <div className={`flex-shrink-0 w-64 rounded-xl border transition-opacity
      ${COL_COLOURS[stage.colour]} ${isPending ? 'opacity-70' : 'opacity-100'}`}>

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-inherit">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-sm ${HDR_COLOURS[stage.colour]}`}>
            {stage.label}
          </h3>
          <span className="text-xs text-gray-400 font-medium">{deals.length}</span>
        </div>
        {totalValue > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">
            R {totalValue.toLocaleString('en-ZA')}
          </p>
        )}
      </div>

      {/* Droppable */}
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-3 min-h-[120px] space-y-2 transition-colors
              ${snapshot.isDraggingOver ? 'bg-blue-100/60' : ''}`}
          >
            {deals.map((deal, index) => (
              <DealKanbanCard key={deal.id} deal={deal} index={index} />
            ))}
            {deals.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-16">
                <p className="text-xs text-gray-300">No deals</p>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
