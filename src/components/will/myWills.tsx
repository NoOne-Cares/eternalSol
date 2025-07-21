'use client'

import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { GetWillsCreatedByMe } from '../../services/GetMyWills' // Adjust path
import { DeleteWill } from '../../services/DeleteWill' // Import your delete function
import { useAtom } from 'jotai'
import { walletPublicKey } from '@/store/jotaiStore'
import { MyWill } from '@/types'

const MyWills = () => {
    const [publicKey] = useAtom(walletPublicKey)
    const queryClient = useQueryClient()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const {
        data: createdWills,
        isLoading: isLoadingCreated,
        error: errorCreated,
    } = useQuery({
        queryKey: ['wills-created', publicKey],
        queryFn: () => GetWillsCreatedByMe(publicKey),
        enabled: !!publicKey,
    })

    const handleDelete = async (sender: string, reciver: string, willId: string) => {
        if (!window.confirm('Are you sure you want to delete this will?')) return

        try {
            setDeletingId(willId)
            await DeleteWill(sender, reciver)
            queryClient.invalidateQueries(['wills-created', publicKey])
        } catch (error) {
            console.error('Failed to delete will:', error)
            alert('Failed to delete will.')
        } finally {
            setDeletingId(null)
        }
    }

    if (!publicKey) {
        return <div className="text-center text-gray-500">Connect your wallet to view wills.</div>
    }

    if (isLoadingCreated) return <div>Loading wills...</div>

    if (errorCreated) {
        return (
            <div className="text-red-500">
                Error loading wills: {(errorCreated as Error)?.message}
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            <div>
                <h2 className="text-xl font-semibold mb-3">📜 Wills Created by Me</h2>
                {createdWills?.length === 0 ? (
                    <p className="text-sm text-gray-500">You haven’t created any wills yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {createdWills.map((will: MyWill) => (
                            <li key={will._id} className="border p-4 rounded-md flex justify-between items-center">
                                <div>
                                    <p><strong>To:</strong> {will.reciver}</p>
                                    <p><strong>Message:</strong> {will.message}</p>
                                    <p><strong>Amount:</strong> {will.amount} SOL</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(will.sender, will.reciver, will._id)}
                                    disabled={deletingId === will._id}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                                >
                                    {deletingId === will._id ? 'Deleting...' : 'Delete'}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default MyWills
