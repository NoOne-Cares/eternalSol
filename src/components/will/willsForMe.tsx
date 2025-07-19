"use client"

import React, { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { useQuery } from '@tanstack/react-query'
import { oracleConnection, walletPublicKey } from '@/store/jotaiStore'
import { GetWillsRecivedByMe } from '@/services/GetMyWills'
import { getWillToBeClaimed, WillResponse, TimeDiffResponse } from '@/services/ClaimWill'
import { sendStoredTransaction } from '@/lib/sendTranjaction'

const WillsForMe = () => {
    const [publicKey] = useAtom(walletPublicKey)
    const [connection] = useAtom(oracleConnection)

    const [claimResult, setClaimResult] = useState<Record<string, WillResponse | TimeDiffResponse | { error?: string }>>({})
    const [loadingClaims, setLoadingClaims] = useState<Record<string, boolean>>({})

    useEffect(() => {
        console.log('👤 Wallet Public Key:', publicKey?.toBase58())
    }, [publicKey])

    const {
        data: receivedWills,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['received-wills', publicKey?.toBase58()],
        queryFn: async () => {
            if (!publicKey) return []
            console.log('📥 Fetching wills for:', publicKey.toBase58())
            const res = await GetWillsRecivedByMe(publicKey.toBase58()) // FIXED HERE
            console.log('✅ Received wills:', res)
            return res || []
        },
        enabled: !!publicKey,
        staleTime: 60 * 1000,
    })

    const handleClaim = async (sender: string, willId: string) => {
        if (loadingClaims[willId]) return
        setLoadingClaims(prev => ({ ...prev, [willId]: true }))

        try {
            console.log(`🔓 Claiming will ${willId} from ${sender}`)
            const result = await getWillToBeClaimed(sender, publicKey!.toBase58())

            if ('transaction' in result && result.transaction && connection) {
                console.log(result.transaction)
                const signature = await sendStoredTransaction({
                    connection,
                    serializedTxBase64: "U2FsdGVkX1+Vhghah6g0CcfIDquvQEnEeML6LiusqawbeswYuv5BDaKc2wO9qalgXMf4/aS+he1hfMRJwcNIWwGnd3PI2UkN3BuOjf4RXO982FF9r7qG/wWt9VrKWgdOvkO6UbEmOicoIORT2tqhb1gQnyjVTI/q9qVULYo1vlGQfaHSY3NqqyvoOF8NeUYQASNYJy+qRW2RuM+rA1TfFgSLEJ1As84oUhw5rF1Hm3Nb9LHw5Eza1WN+TheaYnO/ZFfwTvE9rBycuwZAYTviCgPiUMdJnbLeLNHNNPAF1QKH+HesCVCp+DSWX3kacnS7efo9XbiZySM9GqCgqFFyGJerPtFUZOdYw/SUwF8E1FjzI+CLGkD0qgUV7oIFlpuNcH0OK5PjbUNF2Pk6QKCtVk6b7aICP2h+/ADNsxSBR33SJxpgYTJ03c+cQlPiEzSZEtT9ohdW+SUKklPcnUYUqwXDCwIah+1/ombWDf8Sh//vzebtQm0DG3SND4TfhJau4155p9jyleOxlB75+JGXZDHO8LjRE7a6IM5ohvGJ/8FKj/+UE8C8SKlJ2rDx8eEuiX0UHpALqrQ1YlpOr0DPdZR1bWf3HoZeGatsJVBA/U2RbY73i+Q60iDxxhq9Zd4mRgALF4hHZy35SChGoLZIPplBOAbBf+E3LlOppIuMv/lNTW/ZptVs8PuA6yuEFhGNcBSizT6/OQ4hf9H+mVy9qEzRkeHeguqJ4y+Mkl4zf3AIKtuYMdj35VJBj6v9KDaLOBTf2wKQU0El65WNV5p33oLrBCULMzW5UzF9y+0qPLw=",
                })

                setClaimResult(prev => ({
                    ...prev,
                    [willId]: { ...result, transaction: signature }
                }))
            } else {
                setClaimResult(prev => ({ ...prev, [willId]: result }))
            }

            refetch()
        } catch (err: any) {
            setClaimResult(prev => ({ ...prev, [willId]: { error: err.message } }))
        } finally {
            setLoadingClaims(prev => ({ ...prev, [willId]: false }))
        }
    }

    if (!publicKey) return <div className="text-center mt-6">🔌 Please connect your wallet.</div>
    if (isLoading) return <div className="text-center mt-6">Loading wills...</div>
    if (error) return <div className="text-red-600 mt-6 text-center">❌ Error: {(error as any).message}</div>

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            <h2 className="text-xl font-semibold">📜 Wills For You</h2>

            {receivedWills?.length === 0 ? (
                <p className="text-gray-500">You haven’t received any wills yet.</p>
            ) : (
                <ul className="space-y-3">
                    {receivedWills.map((will: any) => {
                        const id = will._id || will.id || will.sender // fallback
                        const result = claimResult[id]
                        const loading = loadingClaims[id]

                        return (
                            <li key={id} className="border p-4 rounded-md space-y-2">
                                <p><strong>From:</strong> {will.sender}</p>
                                <p><strong>Message:</strong> {will.message}</p>
                                <p><strong>Amount:</strong> {will.amount} SOL</p>

                                <button
                                    onClick={() => handleClaim(will.sender, id)}
                                    disabled={loading}
                                    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Claiming...' : 'Claim'}
                                </button>

                                {result && (
                                    <div className="mt-2 text-sm">
                                        {'timeDiff' in result ? (
                                            <p className="text-yellow-600">⏳ Will not ready. Time left: {result.timeDiff}s</p>
                                        ) : 'error' in result ? (
                                            <p className="text-red-600">❌ {result.error}</p>
                                        ) : (
                                            <p className="text-green-600 break-all">
                                                ✅ Claimed! Signature: <strong>{result.transaction}</strong><br />
                                                <a
                                                    href={`https://explorer.solana.com/tx/${result.transaction}?cluster=devnet`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 underline"
                                                >
                                                    View on Explorer
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

export default WillsForMe
