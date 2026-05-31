'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createContact(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const firstName = (formData.get('first_name') as string)?.trim()
  const lastName  = (formData.get('last_name')  as string)?.trim()
  if (!firstName || !lastName) throw new Error('First name and last name are required')

  const { data: contact, error } = await supabase.from('contacts').insert({
    user_id: user.id, first_name: firstName, last_name: lastName,
    email:     (formData.get('email')     as string) || null,
    phone:     (formData.get('phone')     as string) || null,
    company:   (formData.get('company')   as string) || null,
    job_title: (formData.get('job_title') as string) || null,
  }).select().single()

  if (error) throw new Error(error.message)

  // Log activity
  await supabase.from('activities').insert({
    user_id: user.id, contact_id: contact.id,
    type: 'contact_created',
    description: `Contact created: ${firstName} ${lastName}`,
  })

  revalidatePath('/contacts')
  redirect('/contacts')
}

export async function updateContact(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const firstName = (formData.get('first_name') as string)?.trim()
  const lastName  = (formData.get('last_name')  as string)?.trim()
  if (!firstName || !lastName) throw new Error('First name and last name are required')

  const { error } = await supabase.from('contacts').update({
    first_name: firstName, last_name: lastName,
    email:     (formData.get('email')     as string) || null,
    phone:     (formData.get('phone')     as string) || null,
    company:   (formData.get('company')   as string) || null,
    job_title: (formData.get('job_title') as string) || null,
  }).eq('id', id).eq('user_id', user.id)

  if (error) throw new Error(error.message)

  await supabase.from('activities').insert({
    user_id: user.id, contact_id: id,
    type: 'contact_updated',
    description: `Contact updated: ${firstName} ${lastName}`,
  })

  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
  redirect(`/contacts/${id}`)
}

export async function deleteContact(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('contacts').delete()
    .eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)

  revalidatePath('/contacts')
  redirect('/contacts')
}
