import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'WattFeed — India Power Market Intelligence',
  description: 'Real-time intelligence for global power markets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body className="bg-slate-50 text-slate-800 min-h-screen">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold text-blue-900 tracking-tight">
                ⚡ WattFeed
              </Link>
              <div className="flex gap-8">
                <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors">Home</Link>
                <Link href="/visualizations" className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors">Visualizations</Link>
                <Link href="/feed" className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors">Feed</Link>
                <Link href="/perspectives" className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors">Perspectives</Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 mt-16 py-8 text-center text-sm text-slate-400">
          WattFeed — Real-time intelligence for global power markets
        </footer>
      </body>
    </html>
  )
}