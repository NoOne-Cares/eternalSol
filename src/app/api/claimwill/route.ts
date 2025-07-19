import { connectToDatabase } from '@/lib/db'
import WillModal from '@/models/will'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

export async function GET(request: Request) {
    await connectToDatabase()
    const { searchParams } = new URL(request.url);

    const reciver = searchParams.get('reciver');
    const sender = searchParams.get('sender');
    const connection = new Connection(clusterApiUrl('devnet'))

    if (reciver && sender) {

        try {
            const willToBeClaimed = await WillModal.findOne({ sender, reciver })
            if (willToBeClaimed) {
                const duration = willToBeClaimed.duration
                const publicKey = new PublicKey(sender)

                const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 1 });
                if (signatures.length === 0) {
                    console.log(signatures.length)
                    return Response.json({
                        success: false,
                        message: "Something went worng with the cluster connection"
                    },
                        {
                            status: 501
                        })
                }

                const lastSig = signatures[0];
                const blockTime = await connection.getBlockTime(lastSig.slot);

                if (blockTime == null) {
                    return Response.json({
                        success: false,
                        message: "can't fetch latest blocktime of the use"
                    },
                        {
                            status: 500
                        })
                }

                const currentTime = Math.floor(Date.now() / 1000)
                if (currentTime - blockTime >= duration) {
                    // ✅ Will is claimable
                    return new Response(JSON.stringify(willToBeClaimed), {
                        status: 200,
                    });
                } else {
                    const timeDiff = duration - (currentTime - blockTime)
                    return new Response(JSON.stringify(timeDiff), {
                        status: 201,
                    });
                }

            }
        } catch (error) {
            return Response.json({
                success: false,
                message: "server error"
            },
                {
                    status: 500
                })
        }
    } else {
        return Response.json({
            success: false,
            message: "pleasee connect your Wallet"
        },
            {
                status: 500
            })
    }
}