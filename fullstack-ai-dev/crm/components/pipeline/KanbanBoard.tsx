'use client'
import { useState, useTransition } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { updateDealStage } from '@/app/(dashboard)/deals/actions'
import KanbanColumn from './KanbanColumn'
import type { Deal, Stage } from '@/app/(dashboard)/deals/page'

type Columns = Record<Stage, Deal[]>
type StageConfig = { id: Stage; label: string; colour: string }

export default function KanbanBoard({
  initialColumns,
  stages,
}: {
  initialColumns: Columns
  stages: readonly StageConfig[]
}) {
  const [columns,    setColumns]    = useState<Columns>(initialColumns)
  const [error,      setError]      = useState<string | null>(null)
  const [isPending,  startTransition] = useTransition()

  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId &&
        source.index === destination.index) return

    const srcStage  = source.droppableId      as Stage
    const dstStage  = destination.droppableId as Stage

    const previousColumns = columns

    const srcItems = [...columns[srcStage]]
    const dstItems = srcStage === dstStage ? srcItems : [...columns[dstStage]]

    const [movedDeal] = srcItems.splice(source.index, 1)
    dstItems.splice(destination.index, 0, { ...movedDeal, stage: dstStage })

    setColumns(prev => ({
      ...prev,
      [srcStage]: srcItems,
      [dstStage]: dstItems,
    }))
    setError(null)

    startTransition(async () => {
      try {
        await updateDealStage(draggableId, movedDeal.contact_id, dstStage)
      } catch {
        setColumns(previousColumns)
        setError('Failed to update deal stage. Please try again.')
      }
    })
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg
                        px-4 py-3 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">×</button>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={columns[stage.id] ?? []}
              isPending={isPending}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
