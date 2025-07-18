import { PublicKey } from '@solana/web3.js'
import { connectToDatabase } from '@/lib/db'
import WillModal from '@/models/will'
export async function GET(request: Request) {
    await connectToDatabase()
    const { searchParams } = new URL(request.url);
    const publicKey = searchParams.get('receiver');
    // const publicKey = request.json()
    if (publicKey) {
        try {
            const wills = WillModal.find({ reciver: publicKey }, 'message reciver sender amount -_id')
            return new Response(JSON.stringify(wills), {
                status: 201,
            });
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