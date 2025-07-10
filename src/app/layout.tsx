import './globals.css'
import { AppProviders } from '@/components/app-providers'
import { AppLayout } from '@/components/app-layout'
import { Provider } from 'jotai'
import React from 'react'

// export const metadata: Metadata = {
//   title: 'EternalSOL',
//   description: 'a plafrom to create will for solana',
// }

const links: { label: string; path: string }[] = [
  // More links...
  { label: 'Account', path: '/account' },
  { label: 'Durable', path: '/durable' },
  { label: 'Wills', path: '/wills' },
]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <AppProviders>
          <Provider>
            <AppLayout links={links}>{children}</AppLayout>
          </Provider>
        </AppProviders>
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
