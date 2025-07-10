// lib/sendStoredTx.ts
import { Connection, Transaction } from '@solana/web3.js'

export async function sendStoredTransaction({
    connection,
    serializedTxBase64,
}: {
    connection: Connection,
    serializedTxBase64: string,
}): Promise<string> {
    const buffer = Buffer.from(serializedTxBase64, 'base64')
    const tx = Transaction.from(buffer)

    const sig = await connection.sendRawTransaction(tx.serialize())
    await connection.confirmTransaction(sig, 'confirmed')

    return sig
}
