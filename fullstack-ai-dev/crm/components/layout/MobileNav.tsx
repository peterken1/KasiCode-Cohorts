'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'Home',     href: '/dashboard', icon: '▦' },
  { label: 'Contacts', href: '/contacts',  icon: '👤' },
  { label: 'Pipeline', href: '/deals',     icon: '💼' },
]

export default function MobileNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()

  return (
    <div className="bg-gray-900 text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">C</span>
          </div>
          <span className="font-bold text-sm">MyCRM</span>
        </div>
        <p className="text-gray-500 text-xs truncate max-w-[160px]">{userEmail}</p>
      </div>
      <div className="flex">
        {NAV.map(item => {
          const active = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2.5 text-xs font-medium
                transition-colors
                ${active ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <span className="text-lg mb-0.5">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
