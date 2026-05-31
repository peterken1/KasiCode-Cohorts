import { createContact } from '@/app/(dashboard)/contacts/actions'
import ContactForm from '@/components/contacts/ContactForm'

export default function NewContactPage() {
  return (
    <div className="p-6 lg:p-8 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add contact</h1>
      <ContactForm action={createContact} submitLabel="Add contact" />
    </div>
  )
}
