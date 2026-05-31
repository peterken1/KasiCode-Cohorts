import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ContactCard from '@/components/contacts/ContactCard'

export default async function ContactsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contacts, error } = await supabase
    .from('contacts').select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return <div className="p-8 text-red-600">Failed to load contacts.</div>

  return (
    <div className="p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {contacts?.length ?? 0} contact{contacts?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/contacts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium
                     hover:bg-blue-700 transition-colors">
          + Add contact
        </Link>
      </div>

      {(!contacts || contacts.length === 0) && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-medium">No contacts yet</p>
          <p className="text-sm mt-1">Add your first contact to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts?.map(c => <ContactCard key={c.id} contact={c} />)}
      </div>
    </div>
  )
}
