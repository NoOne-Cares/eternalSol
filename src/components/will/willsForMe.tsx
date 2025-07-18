"use client"

import { oracleConnection, walletPublicKey } from '@/store/jotaiStore'
import { useAtom } from 'jotai'
import React from 'react'


const WillsForMe = () => {
    const [publicKey] = useAtom(walletPublicKey)
    const [connection] = useAtom(oracleConnection)

    const handleClick = async () => {
        let lastTranjaction = ""
        console.log(Math.floor(Date.now() / 1000))
        if (publicKey && connection) {
            const signatures = await connection!.getSignaturesForAddress(publicKey!, { limit: 1 });
            const lastSig = signatures[0];
            const blockTime = await connection!.getBlockTime(lastSig.slot);
            if (blockTime == null) return;
            lastTranjaction = blockTime.toString()
        }
    }

    return (

        <div >
            <button onClick={handleClick}> adsasdasd</button>
        </div>
    )
}

export default WillsForMe