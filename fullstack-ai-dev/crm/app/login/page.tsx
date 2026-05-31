'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  const DEMO_EMAIL    = process.env.NEXT_PUBLIC_DEMO_EMAIL    || ''
  const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || ''

  async function handleLogin() {
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard'); router.refresh()
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">

        {/* Brand */}
        <div className="mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your CRM</p>
        </div>

        {/* Demo banner */}
        {DEMO_EMAIL && (
          <button
            onClick={fillDemo}
            className="w-full mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl
                       text-sm text-blue-700 font-medium hover:bg-blue-100 transition-colors
                       text-left flex items-center gap-3"
          >
            <span className="text-lg">✨</span>
            <div>
              <div className="font-semibold">Try the demo</div>
              <div className="text-xs text-blue-500 font-normal">Click to auto-fill demo credentials</div>
            </div>
            <span className="ml-auto text-blue-400">→</span>
          </button>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                         text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                         text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent"
              placeholder="Your password"
            />
          </div>
          <button
            onClick={handleLogin} disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium
                       text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
