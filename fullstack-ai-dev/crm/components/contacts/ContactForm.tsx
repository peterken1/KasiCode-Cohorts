'use client'
import { useState } from 'react'

type Contact = {
  first_name?: string; last_name?: string; email?: string | null
  phone?: string | null; company?: string | null; job_title?: string | null
}

export default function ContactForm({
  contact, action, submitLabel,
}: {
  contact?: Contact; action: (formData: FormData) => Promise<void>; submitLabel: string
}) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true); setError(null)
    try { await action(formData) }
    catch (err: any) { setError(err.message ?? 'Something went wrong'); setLoading(false) }
  }

  const field = (name: string, label: string, type = 'text', required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type} name={name}
        defaultValue={(contact as any)?.[name] ?? ''}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                   text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:border-transparent"
        placeholder={label}
      />
    </div>
  )

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {field('first_name', 'First name', 'text', true)}
        {field('last_name',  'Last name',  'text', true)}
      </div>
      {field('email',     'Email',     'email')}
      {field('phone',     'Phone',     'tel')}
      {field('company',   'Company')}
      {field('job_title', 'Job title')}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {loading ? 'Saving…' : submitLabel}
        </button>
        <a href="/contacts"
          className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
          Cancel
        </a>
      </div>
    </form>
  )
}
