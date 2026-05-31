import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { updateContact } from '@/app/(dashboard)/contacts/actions'
import ContactForm from '@/components/contacts/ContactForm'

export default async function EditContactPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contact } = await supabase.from('contacts')
    .select('*').eq('id', params.id).eq('user_id', user.id).single()
  if (!contact) notFound()

  const updateWithId = updateContact.bind(null, contact.id)

  return (
    <div className="p-6 lg:p-8 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Edit {contact.first_name} {contact.last_name}
      </h1>
      <ContactForm contact={contact} action={updateWithId} submitLabel="Save changes" />
    </div>
  )
}
