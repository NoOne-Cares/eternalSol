'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Keypair, PublicKey } from '@solana/web3.js';
import { isValidSolanaAddress } from '@/lib/validKey';
import { useWallet } from '@solana/wallet-adapter-react';
import { createNonceAccount } from '@/lib/createNonseAccount';
import { signTransactionWithNonce } from '@/lib/signWithNonce';
import { useAtom } from 'jotai';
import { oracleConnection, walletPublicKey } from '@/store/jotaiStore';
import { encrypt } from '@/lib/encription';
import { useMutation } from '@tanstack/react-query';
import { CreateWill } from '../../services/CreateWill';
import { CanCreateWill } from '@/services/CanCreateWill';



const WillCreateForm = () => {
    const wallet = useWallet()
    const [signedTxBase64, setSignedTxBase64] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [publicKey] = useAtom(walletPublicKey)
    const [connection] = useAtom(oracleConnection)
    const { signTransaction } = useWallet()

    const [NonceKeypair, setNonceKeyPair] = useState(() => Keypair.generate())
    const nonceKeypairAuth = process.env.NEXT_PUBLIC_SOLANA_SECRET_KEY
    if (!nonceKeypairAuth) throw new Error('Missing SOLANA_SECRET_KEY')
    const secretKey = Uint8Array.from(Buffer.from(nonceKeypairAuth, 'base64'))
    const authKeypair = Keypair.fromSecretKey(secretKey)

    // adjust path

    const createWillMutation = useMutation({
        mutationFn: ({
            message,
            sender,
            receiver,
            duration,
            transaction,
            amount,
        }: {
            message: string;
            sender: string;
            receiver: string;
            duration: number;
            transaction: string;
            amount: number;
        }) => CreateWill(message, sender, receiver, duration, transaction, amount),
        onSuccess: (data) => {
            console.log('✅ Will created successfully:', data);
            // alert('✅ Will created successfully');
        },
        onError: (error) => {
            console.error('❌ Error creating will:', error);
            alert('❌ Failed to create will');
        },
    });

    const canCreateWillMutation = useMutation({
        mutationFn: ({ sender, receiver }: { sender: string; receiver: string }) =>
            CanCreateWill(sender, receiver),
    });

    const handleCreateNonce = useCallback(async (recipient: PublicKey, amount: number) => {
        if (!publicKey) return alert('❌ Wallet not connected')
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
            // throw new Error("Noce account creation failed")
            console.log("nonce created successfully")
        } else {
            alert('❌ Failed to create nonce account')
            throw new Error("fail to create nonce")
        }
        const noncePubkey = nonceKeypair.publicKey;
        let txSignedByNonce = ""
        try {

            if (connection && publicKey) {
                alert(`✅ Durable Nonce Account Created!\nSignature: ${connection}`)
                txSignedByNonce = await signTransactionWithNonce({
                    connection,
                    noncePubkey,
                    recipient,
                    publicKey,
                    authKeypair,
                    amount,
                    signTransaction: wallet.signTransaction
                });

            }
            console.log("Signed TX (base64):", txSignedByNonce);
            console.log(typeof txSignedByNonce)
            // alert(`✅ Durable Nonce Account Created!\nSignature: ${txSignedByNonce}`)
            setSignedTxBase64(txSignedByNonce)
            const hashedSignature = encrypt(txSignedByNonce)
            return hashedSignature
        } catch (error: any) {
            return null
        }
    }, [connection, nonceKeypairAuth])


    const [formData, setFormData] = useState({
        message: '',
        receiver: '',
        amount: '',
        years: '',
        months: '',
        days: '',
        hours: '',
        minutes: '',
        seconds: '',
    });
    const [receiverError, setReceiverError] = useState<string | null>(null);

    useEffect(() => {
        if (formData.receiver.trim() === '') {
            setReceiverError(null);
        } else if (!isValidSolanaAddress(formData.receiver)) {
            setReceiverError('Invalid Solana public key');
        } else {
            setReceiverError(null);
        }
    }, [formData.receiver]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true)
        const {
            message,
            receiver,
            amount,
            years,
            months,
            days,
            hours,
            minutes,
            seconds,
        } = formData;



        const totalDurationInSeconds =
            (parseInt(years) || 0) * 365 * 24 * 60 * 60 +
            (parseInt(months) || 0) * 30 * 24 * 60 * 60 +
            (parseInt(days) || 0) * 24 * 60 * 60 +
            (parseInt(hours) || 0) * 60 * 60 +
            (parseInt(minutes) || 0) * 60 +
            (parseInt(seconds) || 0);


        if (!isValidSolanaAddress(formData.receiver)) {
            setReceiverError('Invalid Solana public key');
            return;
        }

        try {
            const senderAddress = publicKey!.toBase58();

            // ✅ Step 1: Call canCreateWill
            const canCreate = await canCreateWillMutation.mutateAsync({
                sender: senderAddress,
                receiver,
            });

            if (!canCreate.success) {
                alert('❌ You are not allowed to create a will with this receiver.');
                setIsSubmitting(false);
                return;
            }

            // ✅ Step 2: Sign with nonce
            const hashedTx = await handleCreateNonce(new PublicKey(receiver), parseFloat(amount));
            if (!hashedTx) {
                alert("❌ Signing failed. Cannot create will.");
                setIsSubmitting(false);
                return;
            }

            // ✅ Step 3: Now call createWill
            await createWillMutation.mutateAsync({
                message,
                sender: senderAddress,
                receiver,
                duration: totalDurationInSeconds,
                transaction: hashedTx,
                amount: parseFloat(amount),
            });

        } catch (err) {
            console.error("❌ Error submitting will form:", err);
            alert("❌ Something went wrong while creating the will.");
        }

        setIsSubmitting(false);
    }





    // console.log('Will Payload:', payload);

    return (
        <div className="relative max-w-2xl mx-auto px-6 py-12 bg-card text-card-foreground rounded-lg shadow-md">

            <h2 className="text-2xl font-semibold mb-6">Create a Will</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Message */}
                <div>
                    <label className="block mb-1 font-medium">Message</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-input text-foreground border border-border rounded-md px-4 py-2"
                        placeholder="Personal message"
                        required
                    />
                </div>

                {/* Receiver */}
                <div>
                    <label className="block mb-1 font-medium">Receiver (Public Key)</label>
                    <input
                        name="receiver"
                        type="text"
                        value={formData.receiver}
                        onChange={handleChange}
                        className={`w-full bg-input text-foreground border rounded-md px-4 py-2 ${receiverError ? 'border-red-500' : 'border-border'
                            }`}
                        placeholder="e.g. 9fj3Kqz..."
                        required
                    />
                    {receiverError && (
                        <p className="text-red-500 text-sm mt-1">{receiverError}</p>
                    )}
                </div>

                {/* Amount */}
                <div>
                    <label className="block mb-1 font-medium">Amount (SOL)</label>
                    <input
                        name="amount"
                        type="number"
                        step="any"
                        value={formData.amount}
                        onChange={handleChange}
                        className="w-full bg-input text-foreground border border-border rounded-md px-4 py-2"
                        placeholder="Enter amount in SOL"
                        min="0"
                        required
                    />
                </div>

                {/* Duration */}
                <div>
                    <label className="block mb-2 font-medium">Inactivity Duration</label>
                    <div className="grid grid-cols-3 gap-3">
                        <input
                            type="number"
                            name="years"
                            placeholder="Years"
                            min={0}
                            value={formData.years}
                            onChange={handleChange}
                            className="bg-input text-foreground border border-border rounded-md px-3 py-2"
                        />
                        <input
                            type="number"
                            name="months"
                            placeholder="Months"
                            min={0}
                            max={11}
                            value={formData.months}
                            onChange={handleChange}
                            className="bg-input text-foreground border border-border rounded-md px-3 py-2"
                        />
                        <input
                            type="number"
                            name="days"
                            placeholder="Days"
                            min={0}
                            max={30}
                            value={formData.days}
                            onChange={handleChange}
                            className="bg-input text-foreground border border-border rounded-md px-3 py-2"
                        />
                        <input
                            type="number"
                            name="hours"
                            placeholder="Hours"
                            min={0}
                            max={23}
                            value={formData.hours}
                            onChange={handleChange}
                            className="bg-input text-foreground border border-border rounded-md px-3 py-2"
                        />
                        <input
                            type="number"
                            name="minutes"
                            placeholder="Minutes"
                            min={0}
                            max={59}
                            value={formData.minutes}
                            onChange={handleChange}
                            className="bg-input text-foreground border border-border rounded-md px-3 py-2"
                        />
                        <input
                            type="number"
                            name="seconds"
                            placeholder="Seconds"
                            min={0}
                            max={59}
                            value={formData.seconds}
                            onChange={handleChange}
                            className="bg-input text-foreground border border-border rounded-md px-3 py-2"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Create Will'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default WillCreateForm
