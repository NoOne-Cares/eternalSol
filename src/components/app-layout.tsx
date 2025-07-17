'use client'

import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { AppHeader } from '@/components/app-header'
import React, { useEffect } from 'react'
import { AppFooter } from '@/components/app-footer'
import { ClusterChecker } from '@/components/cluster/cluster-ui'
import { AccountChecker } from '@/components/account/account-ui'


import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useAtom } from 'jotai';
import { walletPublicKey, oracleConnection } from '@/store/jotaiStore';

export function AppLayout({
  children,
  links,
}: {
  children: React.ReactNode
  links: { label: string; path: string }[]
}) {

  const { connected, publicKey } = useWallet();
  const { connection } = useConnection()
  const [, setWalletPublicKey] = useAtom(walletPublicKey);
  const [, setOraclePublicKey] = useAtom(oracleConnection);
  useEffect(() => {
    if (connected && publicKey && connection) {
      setWalletPublicKey(publicKey);
      setOraclePublicKey(connection)
    } else {
      setWalletPublicKey(null);
      setOraclePublicKey(null)
    }
  }, [connected, publicKey, connection]);


  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="flex flex-col min-h-screen">
        <AppHeader links={links} />
        <main className="flex-grow container mx-auto p-4">
          <ClusterChecker>
            <AccountChecker />
          </ClusterChecker>
          {children}
        </main>
        <AppFooter />
      </div>
      <Toaster />
    </ThemeProvider>
  )
}
