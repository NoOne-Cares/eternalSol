import { PublicKey } from '@solana/web3.js'
import { connectToDatabase } from '@/lib/db'
import WillModal from '@/models/will'
export async function GET(request: Request) {
    await connectToDatabase()
    const { searchParams } = new URL(request.url);
    const publicKey = searchParams.get('sender');
    // const publicKey = request.json()
    try {
        if (publicKey) {
            new PublicKey(publicKey);
        } else {
            return Response.json({
                success: false,
                message: "pleasee connect your Wallet"
            },
                {
                    status: 500
                })
        }

        try {
            const wills = WillModal.find({ sender: publicKey }, 'message reciver sender amount createdAt duration -_id')
            return new Response(JSON.stringify(wills), {
                status: 201,
            });
        } catch (error) {
            return Response.json({
                success: false,
                message: "Fail to fetch wills"
            },
                {
                    status: 500
                })
        }
    } catch (error) {
        console.log("no valid key found")
        return Response.json({
            success: false,
            message: "No valid keey found"
        })
    }
}