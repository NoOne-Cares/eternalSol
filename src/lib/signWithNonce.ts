// lib/signWithNonce.ts
import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
    NonceAccount,
    PublicKey,
} from '@solana/web3.js'

export async function signTransactionWithNonce({
    connection,
    noncePubkey,
    recipient,
    publicKey,
    authKeypair,
    signTransaction,
}: {
    connection: Connection,
    noncePubkey: PublicKey,
    recipient: PublicKey,
    publicKey: PublicKey,
    authKeypair: Keypair,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
}): Promise<string> {
    const accountInfo = await connection.getAccountInfo(noncePubkey)
    if (!accountInfo?.data) throw new Error('Nonce account not found')

    const nonceAccount = NonceAccount.fromAccountData(accountInfo.data)

    const tx = new Transaction({
        feePayer: publicKey,
        recentBlockhash: nonceAccount.nonce,
    })

    tx.add(
        SystemProgram.nonceAdvance({
            noncePubkey,
            authorizedPubkey: authKeypair.publicKey,
        }),
        SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipient,
            lamports: 0.001 * LAMPORTS_PER_SOL,
        })
    )

    tx.partialSign(authKeypair)

    const signedTx = await signTransaction(tx)
    return signedTx.serialize().toString('base64')
}
