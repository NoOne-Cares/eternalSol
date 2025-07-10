import { PublicKey } from '@solana/web3.js'
import { connectToDatabase } from '@/lib/db'
import WillModal from '@/models/will'
export async function GET(request: Request) {
    await connectToDatabase()
    const publicKey = request.json()
    try {
        new PublicKey(publicKey);
        try {
            const wills = WillModal.find({ sender: publicKey }, 'message reciver sender amount createdAt duration -_id')
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
    } catch (error) {
        console.log("no valid key found")
        return Response.json({
            success: false,
            message: "No valid keey found"
        })
    }
}