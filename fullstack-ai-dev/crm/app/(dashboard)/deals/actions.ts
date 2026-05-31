'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Activity logger ────────────────────────────────────────────────────────
async function logActivity(supabase: any, {
  userId, contactId, dealId, type, description, metadata,
}: {
  userId: string; contactId?: string; dealId?: string
  type: string; description: string; metadata?: Record<string, any>
}) {
  await supabase.from('activities').insert({
    user_id: userId, contact_id: contactId ?? null,
    deal_id: dealId ?? null, type, description,
    metadata: metadata ?? null,
  })
}

// ─── DEALS ──────────────────────────────────────────────────────────────────
export async function createDeal(contactId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = (formData.get('title') as string)?.trim()
  if (!title) throw new Error('Deal title is required')

  const { data: deal, error } = await supabase.from('deals').insert({
    user_id: user.id, contact_id: contactId, title,
    value: parseFloat(formData.get('value') as string) || 0,
    stage: (formData.get('stage') as string) || 'lead',
    description: (formData.get('description') as string) || null,
    expected_close_date: (formData.get('expected_close_date') as string) || null,
  }).select().single()

  if (error) throw new Error(error.message)

  await logActivity(supabase, {
    userId: user.id, contactId, dealId: deal.id,
    type: 'deal_created',
    description: `Deal created: ${deal.title}`,
    metadata: { stage: deal.stage, value: deal.value },
  })

  revalidatePath(`/contacts/${contactId}`)
}

export async function updateDealStage(dealId: string, contactId: string, newStage: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: current } = await supabase.from('deals')
    .select('stage, title').eq('id', dealId).eq('user_id', user.id).single()

  const { error } = await supabase.from('deals')
    .update({ stage: newStage }).eq('id', dealId).eq('user_id', user.id)
  if (error) throw new Error(error.message)

  await logActivity(supabase, {
    userId: user.id, contactId, dealId,
    type: 'deal_stage_changed',
    description: `Deal moved: ${current?.title} → ${newStage}`,
    metadata: { from: current?.stage, to: newStage },
  })

  revalidatePath(`/contacts/${contactId}`)
  revalidatePath('/deals')
}

export async function deleteDeal(dealId: string, contactId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('deals')
    .delete().eq('id', dealId).eq('user_id', user.id)
  if (error) throw new Error(error.message)

  revalidatePath(`/contacts/${contactId}`)
  revalidatePath('/deals')
}

// ─── NOTES ──────────────────────────────────────────────────────────────────
export async function addNote(contactId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const content = (formData.get('content') as string)?.trim()
  if (!content) throw new Error('Note content is required')

  const { error } = await supabase.from('notes').insert({
    user_id: user.id, contact_id: contactId, content,
  })
  if (error) throw new Error(error.message)

  await supabase.from('activities').insert({
    user_id: user.id, contact_id: contactId,
    type: 'note_added', description: 'Note added',
    metadata: { preview: content.slice(0, 80) },
  })

  revalidatePath(`/contacts/${contactId}`)
}

export async function deleteNote(noteId: string, contactId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('notes')
    .delete().eq('id', noteId).eq('user_id', user.id)
  if (error) throw new Error(error.message)

  revalidatePath(`/contacts/${contactId}`)
}
