'use client'
import React, { useCallback, useState } from 'react'
import {
    Connection,
    Keypair,
    PublicKey,
} from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { createNonceAccount } from '@/lib/createNonseAccount'
import { signTransactionWithNonce } from '@/lib/signWithNonce'
import { sendStoredTransaction } from '@/lib/sendTranjaction'
import { useAtom } from 'jotai'
import { oracleConnection, walletPublicKey } from '@/store/jotaiStore'

const Durable: React.FC = () => {
    const [connection] = useAtom(oracleConnection)
    const [publicKey] = useAtom(walletPublicKey)
    const { signTransaction } = useWallet()

    const [NonceKeypair, setNonceKeyPair] = useState(() => Keypair.generate())
    const nonceKeypairAuth = process.env.NEXT_PUBLIC_SOLANA_SECRET_KEY
    if (!nonceKeypairAuth) throw new Error('Missing SOLANA_SECRET_KEY')

    const secretKey = Uint8Array.from(Buffer.from(nonceKeypairAuth, 'base64'))

    const authKeypair = Keypair.fromSecretKey(secretKey)
    // console.log('🔑 Loaded Keypair Public Key:', authKeypair.publicKey.toBase58())
    const [signedTxBase64, setSignedTxBase64] = useState<string | null>(null)
    const [status, setStatus] = useState<string>('')

    const base58String = 'AwZF8bvPojfNbZN8SrUN8bzbDH3evZv3hRcvy85zUNeQ'
    const recipient = new PublicKey(base58String)

    const handleCreateNonce = useCallback(async () => {
        if (!publicKey && !connection) return alert('❌ Wallet not connected')
        // findlatesttime();
        const nonceKeypair = Keypair.generate();
        setNonceKeyPair(nonceKeypair);
        console.log(NonceKeypair + " " + "this is new" + nonceKeypair)
        let sig = ""
        if (connection) {
            sig = await createNonceAccount({
                connection,
                nonceKeypair,
                authKeypair
            });
        }

        console.log(sig)
        if (sig != "fall to create will") {
            alert(`✅ Durable Nonce Account Created!\nSignature: ${sig}`)
        } else {
            alert('❌ Failed to create nonce account')
            return
        }
        const noncePubkey = nonceKeypair.publicKey;
        try {
            let txSignedByNonce = ""
            if (connection && publicKey) {
                txSignedByNonce = await signTransactionWithNonce({
                    connection,
                    noncePubkey,
                    recipient,
                    publicKey,
                    authKeypair,
                    signTransaction
                });
            }

            console.log("Signed TX (base64):", txSignedByNonce);
            alert(`✅ Durable Nonce Account Created!\nSignature: ${txSignedByNonce}`)
            setSignedTxBase64(txSignedByNonce)
        } catch (err: any) {
            alert("❌ Failed to sign transaction: " + err.message);
        }


    }, [connection, nonceKeypairAuth])



    const handleSendStoredTx = useCallback(async () => {
        if (!signedTxBase64) return alert('❌ No stored transaction found')

        setStatus('⏳ Sending stored transaction...')

        try {
            const sendTx = await sendStoredTransaction({
                connection,
                serializedTxBase64: signedTxBase64,
            })
            alert(`✅ Transaction sent!\nSignature: ${sendTx}`)
        } catch (err: any) {
            console.error('Send error:', err)
            alert(`❌ Failed to send transaction: ${err.message || err}`)
            setStatus('')
        }
    }, [signedTxBase64, connection])

    ///find block time
    // 

    return (
        <div className="p-8 max-w-xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-center text-indigo-700">🧱 Durable Nonce Tool</h2>

            <button
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={handleCreateNonce}
            >
                1️⃣ Create Durable Nonce Account
            </button>

            {/* <button
                className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition"
                onClick={handleSignWithNonce}
            >
                2️⃣ Sign Transaction with Durable Nonce
            </button> */}

            <button
                className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                onClick={handleSendStoredTx}
            >
                3️⃣ Send Stored Transaction
            </button>

            {status && (
                <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded border border-yellow-300 text-center">
                    {status}
                </div>
            )}
            {/* <button
                className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                onClick={createKey}
            >
                create key
            </button> */}
        </div>
    )
}

export default Durable
