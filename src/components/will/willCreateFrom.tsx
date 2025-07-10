'use client';

import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useAtom } from 'jotai';
import { showWillModalAtom } from '@/store/jotaiStore';

const isValidSolanaAddress = (address: string): boolean => {
    try {
        const key = new PublicKey(address);
        return PublicKey.isOnCurve(key); // Valid ed25519 key
    } catch {
        return false;
    }
};

const WillCreateForm = () => {
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
    const [_, setShowModal] = useAtom(showWillModalAtom)
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValidSolanaAddress(formData.receiver)) {
            setReceiverError('Invalid Solana public key');
            return;
        }

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

        const payload = {
            message,
            receiver,
            amount: parseFloat(amount),
            totalDurationInSeconds,
        };

        console.log('Will Payload:', payload);
        // Handle smart contract or backend call here
    };

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
                        placeholder="Optional personal message"
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
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition"
                    >
                        Create Will
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WillCreateForm;
