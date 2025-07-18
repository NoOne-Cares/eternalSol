import { PublicKey } from '@solana/web3.js'
import { connectToDatabase } from '@/lib/db'
import WillModal from '@/models/will'
export async function GET(request: Request) {
    await connectToDatabase()
    const { searchParams } = new URL(request.url);
    const reciver = searchParams.get('receiver');
    const sender = searchParams.get('sender');
    // const publicKey = request.json()
    if (sender && reciver) {
        try {
            const existingWill = await WillModal.findOne({ sender, reciver })
            if (existingWill) {
                return new Response(JSON.stringify({
                    success: false,
                    message: "You can't create will for same reciver address"
                }), { status: 409 });
            }

            return new Response(JSON.stringify({
                success: true,
                message: "You can create a new will"
            }), { status: 200 });

        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                message: "failed to verify details"
            }), {
                status: 500
            })
        }
    } else {
        return new Response(JSON.stringify({
            success: false,
            message: "please input valid paraments"
        }), {
            status: 500
        })
    }
}
