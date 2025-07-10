import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    NONCE_ACCOUNT_LENGTH,
    sendAndConfirmRawTransaction,
} from '@solana/web3.js'

export async function createNonceAccount({
    connection,
    nonceKeypair,
    authKeypair,
}: {
    connection: Connection,
    nonceKeypair: Keypair,
    authKeypair: Keypair,
}): Promise<string> {
    const lamports = await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH)
    const { blockhash } = await connection.getLatestBlockhash()

    const tx = new Transaction({ feePayer: authKeypair.publicKey, recentBlockhash: blockhash })

    tx.add(
        SystemProgram.createAccount({
            fromPubkey: authKeypair.publicKey,
            newAccountPubkey: nonceKeypair.publicKey,
            lamports,
            space: NONCE_ACCOUNT_LENGTH,
            programId: SystemProgram.programId,
        }),
        SystemProgram.nonceInitialize({
            noncePubkey: nonceKeypair.publicKey,
            authorizedPubkey: authKeypair.publicKey,
        })
    )

    tx.sign(nonceKeypair, authKeypair)

    const sig = await sendAndConfirmRawTransaction(connection, tx.serialize())
    return sig
}
