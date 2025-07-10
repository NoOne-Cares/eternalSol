'use client'
import React, { useCallback, useState } from 'react'
import {
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
    NONCE_ACCOUNT_LENGTH,
    PublicKey,
    NonceAccount,
    sendAndConfirmRawTransaction,
} from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

const Durable: React.FC = () => {
    const { connection } = useConnection()
    const { publicKey, signTransaction } = useWallet()
    const wallet = useWallet()
    let nonceKeypair: Keypair

    const nonceKeypairAuth = process.env.NEXT_PUBLIC_SOLANA_SECRET_KEY
    if (!nonceKeypairAuth) throw new Error('Missing SOLANA_SECRET_KEY')

    const secretKey = Uint8Array.from(Buffer.from(nonceKeypairAuth, 'base64'))

    const authkeypair = Keypair.fromSecretKey(secretKey)
    console.log('🔑 Loaded Keypair Public Key:', authkeypair.publicKey.toBase58())
    const [signedTxBase64, setSignedTxBase64] = useState<string | null>(null)
    const [status, setStatus] = useState<string>('')

    const base58String = 'AwZF8bvPojfNbZN8SrUN8bzbDH3evZv3hRcvy85zUNeQ'
    const recipient = new PublicKey(base58String)

    const handleCreateNonce = useCallback(async () => {
        if (!publicKey || !wallet) return alert('❌ Wallet not connected')
        findlatesttime();
        try {
            [nonceKeypair] = useState(() => Keypair.generate())
            const lamports = await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH)
            const { blockhash } = await connection.getLatestBlockhash()

            const tx = new Transaction({ feePayer: authkeypair.publicKey, recentBlockhash: blockhash })

            tx.add(
                SystemProgram.createAccount({
                    fromPubkey: authkeypair.publicKey, // ✅ wallet pays
                    newAccountPubkey: nonceKeypair.publicKey,
                    lamports,
                    space: NONCE_ACCOUNT_LENGTH,
                    programId: SystemProgram.programId,
                }),
                SystemProgram.nonceInitialize({
                    noncePubkey: nonceKeypair.publicKey,
                    authorizedPubkey: authkeypair.publicKey,
                })
            )

            // Let the wallet sign (must include nonceKeypair and nonceKeypairAuth manually)
            tx.sign(nonceKeypair, authkeypair)
            let sig = ""
            console.log("sucess")
            sig = await sendAndConfirmRawTransaction(
                connection,
                tx.serialize(),
            );
            console.log("Nonce initiated: ", sig);

            alert(`✅ Durable Nonce Account Created!\nSignature: ${sig}`)
        } catch (err) {
            console.error(err)
            alert('❌ Failed to create nonce account')
        }
    }, [connection, publicKey, signTransaction, wallet, nonceKeypairAuth])

    const handleSignWithNonce = useCallback(async () => {
        if (!publicKey || !signTransaction) return alert('❌ Wallet not connected')

        try {
            const accountInfo = await connection.getAccountInfo(nonceKeypair.publicKey)
            if (!accountInfo?.data) throw new Error('Nonce account not found')

            const nonceAccount = NonceAccount.fromAccountData(accountInfo.data)

            const tx = new Transaction({
                feePayer: publicKey,
                recentBlockhash: nonceAccount.nonce,
            })

            const advanceNonceIx = SystemProgram.nonceAdvance({
                noncePubkey: nonceKeypair.publicKey,
                authorizedPubkey: authkeypair.publicKey,
            })

            const transferIx = SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: recipient,
                lamports: 1 * LAMPORTS_PER_SOL,
            })

            tx.add(advanceNonceIx, transferIx)

            // Sign with nonce authority, then let wallet sign
            tx.partialSign(authkeypair)
            const signedTx = await signTransaction(tx)

            const serialized = signedTx.serialize().toString('base64')
            setSignedTxBase64(serialized)

            alert('✅ Transaction signed with durable nonce and stored.')

        } catch (err: any) {
            console.error(err)
            alert(`❌ Signing failed: ${err.message || err}`)
        }
    }, [connection, publicKey, signTransaction, nonceKeypairAuth, recipient])

    const handleSendStoredTx = useCallback(async () => {
        if (!signedTxBase64) return alert('❌ No stored transaction found')

        setStatus('⏳ Sending stored transaction...')

        try {
            const buffer = Buffer.from(signedTxBase64, 'base64')
            const tx = Transaction.from(buffer)

            const sig = await connection.sendRawTransaction(tx.serialize())
            await connection.confirmTransaction(sig, 'confirmed')

            setStatus('')
            alert(`✅ Transaction sent!\nSignature: ${sig}`)
        } catch (err: any) {
            console.error('Send error:', err)
            alert(`❌ Failed to send transaction: ${err.message || err}`)
            setStatus('')
        }
    }, [signedTxBase64, connection])

    ///find block time
    const findlatesttime = async () => {
        const signatures = await connection.getSignaturesForAddress(publicKey!, { limit: 1 });
        const lastSig = signatures[0];
        const blockTime = await connection.getBlockTime(lastSig.slot);
        if (blockTime == null) return;
        const lastTxDate = new Date(blockTime * 1000).toLocaleString();
        console.log(`🕒 Last transaction time: ${lastTxDate}`);
    }

    return (
        <div className="p-8 max-w-xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-center text-indigo-700">🧱 Durable Nonce Tool</h2>

            <button
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={handleCreateNonce}
            >
                1️⃣ Create Durable Nonce Account
            </button>

            <button
                className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition"
                onClick={handleSignWithNonce}
            >
                2️⃣ Sign Transaction with Durable Nonce
            </button>

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
        </div>
    )
}

export default Durable
