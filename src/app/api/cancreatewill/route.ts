import { connectToDatabase } from '@/lib/db';
import WillModal from '@/models/will';

export async function GET(request: Request) {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const reciver = searchParams.get('reciver');

    const sender = searchParams.get('sender');
    if (!sender || !reciver) {
        return new Response(JSON.stringify({
            success: false,
            message: "Missing sender or reciver"
        }), {
            status: 400
        });
    }

    try {
        const existingWill = await WillModal.findOne({ sender, reciver });
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
        console.error("Error checking will:", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Failed to verify details"
        }), {
            status: 500
        });
    }
}
