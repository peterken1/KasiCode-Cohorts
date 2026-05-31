import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MyCRM — Full-Stack AI Dev',
  description: 'AI-powered CRM built with Next.js, Supabase, and Claude',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
