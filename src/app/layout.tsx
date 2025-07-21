import './globals.css'
import { AppProviders } from '@/components/app-providers'
import { AppLayout } from '@/components/app-layout'
import React from 'react'
import { Provider } from 'jotai'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EternalSOL',
  description: 'A plafrom to create will for solana',
}

const links: { label: string; path: string }[] = [
  // More links...
  { label: 'Account', path: '/account' },
  { label: 'Wills', path: '/wills' },
]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <Provider>
          <AppProviders>
            <AppLayout links={links}>{children}</AppLayout>
          </AppProviders>
        </Provider>
      </body>
    </html>
  )
}
// Patch BigInt so we can log it using JSON.stringify without any errors
declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}
