'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/auth/actions'

const NAV = [
  { label: 'Dashboard', href: '/dashboard',  icon: '▦' },
  { label: 'Contacts',  href: '/contacts',   icon: '👤' },
  { label: 'Pipeline',  href: '/deals',      icon: '💼' },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-56 bg-gray-900 text-white flex flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-white tracking-tight">MyCRM</span>
        </div>
        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                font-medium transition-colors
                ${active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-800">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                       text-gray-500 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span className="w-5 text-center">↩</span>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
