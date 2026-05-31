import Link from 'next/link'

type Contact = {
  id: string; first_name: string; last_name: string
  email: string | null; phone: string | null
  company: string | null; job_title: string | null
}

export default function ContactCard({ contact: c }: { contact: Contact }) {
  const initials = `${c.first_name[0]}${c.last_name[0]}`.toUpperCase()
  return (
    <Link href={`/contacts/${c.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-5
                 hover:border-blue-300 hover:shadow-sm transition-all group">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700
                        flex items-center justify-center font-semibold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate
                        group-hover:text-blue-700 transition-colors">
            {c.first_name} {c.last_name}
          </p>
          {c.job_title && <p className="text-xs text-gray-500 truncate">{c.job_title}</p>}
        </div>
      </div>
      <div className="space-y-1">
        {c.company && (
          <p className="text-sm text-gray-600 truncate">
            <span className="text-gray-400">Company  </span>{c.company}
          </p>
        )}
        {c.email && (
          <p className="text-sm text-gray-600 truncate">
            <span className="text-gray-400">Email  </span>{c.email}
          </p>
        )}
        {c.phone && (
          <p className="text-sm text-gray-600 truncate">
            <span className="text-gray-400">Phone  </span>{c.phone}
          </p>
        )}
      </div>
    </Link>
  )
}
