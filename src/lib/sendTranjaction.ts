import { Connection, Transaction } from '@solana/web3.js'

// export async function sendStoredTransaction({
//     connection,
//     serializedTxBase64,
// }: {
//     connection: Connection,
//     serializedTxBase64: string,
// }): Promise<string> {
//     const buffer = Buffer.from(serializedTxBase64, 'base64')
//     const tx = Transaction.from(buffer)

//     const sig = await connection.sendRawTransaction(tx.serialize())
//     await connection.confirmTransaction(sig, 'confirmed')

//     return sig
// }


export async function sendStoredTransaction({
    connection,
    serializedTxBase64,
}: {
    connection: Connection,
    serializedTxBase64: string,
}): Promise<string> {
    if (!serializedTxBase64 || typeof serializedTxBase64 !== 'string') {
        throw new Error('Invalid transaction base64 string')
    }

    let tx: Transaction
    try {
        const buffer = Buffer.from(serializedTxBase64, 'base64')
        tx = Transaction.from(buffer)
    } catch (error) {
        console.error('❌ Failed to deserialize transaction:', error)
        throw new Error('Malformed transaction data (base64 decode error)')
    }

    const sig = await connection.sendRawTransaction(tx.serialize())
    await connection.confirmTransaction(sig, 'confirmed')

    return sig
}
