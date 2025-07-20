"use client"

import React, { useState } from 'react'
import { useAtom } from 'jotai'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { oracleConnection, walletPublicKey } from '@/store/jotaiStore'
import { GetWillsRecivedByMe } from '@/services/GetMyWills'
import { getWillToBeClaimed, WillResponse, TimeDiffResponse } from '@/services/ClaimWill'
import { sendStoredTransaction } from '@/lib/sendTranjaction'
import { decrypt } from '@/lib/encription'
import { toast } from 'react-toastify'
import { DeleteWill } from '@/services/DeleteWill'

type ReceivedWill = {
    _id?: string
    message?: string
    sender?: string
    reciver?: string
    duration?: number
    transaction?: string
    amount?: number
}

const WillsForMe = () => {
    const [publicKey] = useAtom(walletPublicKey)
    const [connection] = useAtom(oracleConnection)
    const [claimResult, setClaimResult] = useState<Record<string, WillResponse | TimeDiffResponse | { error?: string }>>({})
    const [loadingWillId, setLoadingWillId] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const {
        data: receivedWills = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['received-wills', publicKey?.toBase58()],
        queryFn: () => GetWillsRecivedByMe(publicKey!.toBase58()),
        enabled: !!publicKey,
    })



    const handleClaim = async (sender: string, willId: string) => {
        console.log("Claim button clicked", { sender, willId })
        if (!willId || !publicKey || !connection) {
            return
        }

        setLoadingWillId(willId)

        try {
            const result = await getWillToBeClaimed(sender, publicKey.toBase58())

            if ('transaction' in result && result.transaction) {
                const tx = decrypt(result.transaction)

                const signature = await sendStoredTransaction({
                    connection,
                    serializedTxBase64: tx,
                })



                setClaimResult(prev => ({
                    ...prev,
                    [willId]: { ...result, transaction: signature }
                }))
                setTimeout(async () => {
                    try {
                        await DeleteWill(sender, publicKey.toBase58())
                        queryClient.invalidateQueries(['received-wills', publicKey.toBase58()])
                    } catch (error) {
                        console.log("failed to delete")
                    }
                }, 5000)


            } else {
                setClaimResult(prev => ({ ...prev, [willId]: result }))
            }
            toast.success("successfully calimed you will", { autoClose: 5000 })
        } catch (err: any) {
            setClaimResult(prev => ({ ...prev, [willId]: { error: err.message || 'Unknown error' } }))
            toast.error(` Claim failed: ${err.message || 'Unknown error'}`)
        } finally {
            setLoadingWillId(null)
        }
    }

    if (!publicKey) {
        return <div className="text-center mt-6">🔌 Please connect your wallet.</div>
    }

    if (isLoading) {
        return <div className="text-center mt-6">Loading wills...</div>
    }

    if (error) {
        return <div className="text-red-600 mt-6 text-center">❌ Error: {(error as any).message}</div>
    }
    console.log(receivedWills)

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            <h2 className="text-xl font-semibold"> Wills For You</h2>

            {receivedWills.length === 0 ? (
                <p className="text-gray-500">You haven’t received any wills yet.</p>
            ) : (
                <ul className="space-y-3">
                    {receivedWills.map((will: ReceivedWill) => {
                        const id = will._id

                        const result = claimResult[id!]
                        const isLoadingClaim = loadingWillId === id

                        return (
                            <li key={id} className="border p-4 rounded-md space-y-2">
                                <p><strong>From:</strong> {will.sender}</p>
                                <p><strong>Message:</strong> {will.message}</p>
                                <p><strong>Amount:</strong> {will.amount} SOL</p>

                                <button
                                    onClick={() => handleClaim(will.sender!, will._id!)}
                                    disabled={isLoadingClaim}
                                    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isLoadingClaim ? 'Claiming...' : 'Claim'}
                                </button>

                                {result && (
                                    <div className="mt-2 text-sm">
                                        {'timeDiff' in result ? (
                                            <p className="text-yellow-600">
                                                You can claim this will after: {result.timeDiff}s
                                            </p>
                                        ) : 'error' in result ? (
                                            <p className="text-red-600"> {result.error}</p>
                                        ) : null}
                                    </div>
                                )}
                                {claimResult[will._id!] && (
                                    <div>

                                        <p className="text-green-400"> successfully claimed you will</p>
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
