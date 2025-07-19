import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    SystemProgram,
    NonceAccount,
    LAMPORTS_PER_SOL,
    VersionedTransaction,
} from '@solana/web3.js';


export async function signTransactionWithNonce({
    connection,
    noncePubkey,
    recipient,
    publicKey,
    authKeypair,
    amount,
    signTransaction,
}: {
    connection: Connection;
    noncePubkey: PublicKey;
    recipient: PublicKey;
    publicKey: PublicKey;
    authKeypair: Keypair;
    amount: number,
    signTransaction?: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
}): Promise<string> {
    try {
        if (!signTransaction) {
            throw new Error('❌ Wallet does not support transaction signing.');
        }

        const accountInfo = await connection.getAccountInfo(noncePubkey);
        if (!accountInfo?.data) {
            throw new Error('❌ Nonce account not found.');
        }

        const nonceAccount = NonceAccount.fromAccountData(accountInfo.data);

        const tx = new Transaction({
            feePayer: publicKey,
            recentBlockhash: nonceAccount.nonce,
        });

        tx.add(
            SystemProgram.nonceAdvance({
                noncePubkey,
                authorizedPubkey: authKeypair.publicKey,
            }),
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: recipient,
                lamports: amount * LAMPORTS_PER_SOL,
            })
        );


        tx.partialSign(authKeypair);
        const signedTx = await signTransaction(tx);
        const serializedTx = signedTx.serialize().toString('base64');

        console.log('✅ Signed transaction with durable nonce:', serializedTx);

        return serializedTx;
    } catch (err: any) {
        console.error('❌ Error signing transaction with nonce:', err);
        throw new Error(err.message || 'Unknown error during signing');
    }
}
