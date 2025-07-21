'use client';

import { FC, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '../ui/button';
import { WalletButton } from '@/components/solana/solana-provider'
import WillCreateForm from '../will/willCreateFrom';

const Hero: FC = () => {
  const { connected } = useWallet();
  const targetRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="w-full min-h-full max-h-full flex items-center justify-center py-24 md:py-36 bg-background text-foreground relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-6 md:px-10 text-center max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Immortalize Your Legacy<br className="hidden md:inline" />
          <span className="bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
            on Solana.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Write a will that outlives you. Securely transfer your SOL to loved ones after a chosen period of wallet inactivity. No lawyers. No middlemen. Just pure cryptographic trust.
        </p>
        <div className=' lg:pb-40 md:pb-60 sm:pb-60' >
          {connected ? (
            <Button variant="outline" onClick={handleClick} >
              Create Your Will
            </Button>
          ) : (

            <WalletButton />
          )}
        </div>
        {connected && (<div ref={targetRef}>
          <WillCreateForm />
        </div>)}
      </div>
    </section>
  );
};

export default Hero;
