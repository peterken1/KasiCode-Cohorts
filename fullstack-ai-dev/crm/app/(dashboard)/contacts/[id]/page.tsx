import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { deleteContact } from '@/app/(dashboard)/contacts/actions'
import { deleteDeal } from '@/app/(dashboard)/deals/actions'
import { deleteNote } from '@/app/(dashboard)/deals/actions'
import DeleteButton from '@/components/contacts/DeleteButton'
import DealCard from '@/components/deals/DealCard'
import DealForm from '@/components/deals/DealForm'
import NoteForm from '@/components/notes/NoteForm'
import NoteList from '@/components/notes/NoteList'
import ActivityFeed from '@/components/activities/ActivityFeed'
import ContactSummariser from '@/components/ai/ContactSummariser'

export default async function ContactDetailPage({
  params,
}: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contact } = await supabase
    .from('contacts')
    .select('*, deals(*, order:created_at.desc), notes(*, order:created_at.desc), activities(*, order:created_at.desc)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!contact) notFound()

  const deleteContactWithId = deleteContact.bind(null, contact.id)

  return (
    <div className="p-6 lg:p-8 max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700
                          flex items-center justify-center font-bold text-xl flex-shrink-0">
            {contact.first_name[0]}{contact.last_name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {contact.first_name} {contact.last_name}
            </h1>
            {contact.job_title && (
              <p className="text-gray-500 text-sm">
                {contact.job_title}{contact.company ? ` · ${contact.company}` : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/contacts/${contact.id}/edit`}
            className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg
                       hover:border-gray-400 transition-colors">
            Edit
          </Link>
          <DeleteButton action={deleteContactWithId} />
        </div>
      </div>

      {/* Contact details strip */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Email',   value: contact.email },
            { label: 'Phone',   value: contact.phone },
            { label: 'Company', value: contact.company },
            { label: 'Title',   value: contact.job_title },
          ].map(({ label, value }) => value ? (
            <div key={label}>
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-sm text-gray-900 truncate">{value}</p>
            </div>
          ) : null)}
        </div>
      </div>

      {/* AI Summariser */}
      <div className="mb-6">
        <ContactSummariser contactId={contact.id} />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: deals + notes */}
        <div className="lg:col-span-2 space-y-6">

          {/* Deals */}
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">Deals</h2>
              <span className="text-xs text-gray-400">
                {contact.deals?.length ?? 0} deal{contact.deals?.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-3 mb-4">
              {contact.deals?.map((deal: any) => (
                <DealCard key={deal.id} deal={deal} contactId={contact.id} />
              ))}
              {(!contact.deals || contact.deals.length === 0) && (
                <p className="text-sm text-gray-400">No deals yet.</p>
              )}
            </div>
            <DealForm contactId={contact.id} />
          </section>

          {/* Notes */}
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Notes</h2>
            <NoteForm contactId={contact.id} />
            <NoteList notes={contact.notes ?? []} contactId={contact.id} />
          </section>
        </div>

        {/* Right: activity */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Activity</h2>
          <ActivityFeed activities={contact.activities ?? []} />
        </div>

      </div>

      <Link href="/contacts"
        className="inline-block mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors">
        ← Back to contacts
      </Link>
    </div>
  )
}
