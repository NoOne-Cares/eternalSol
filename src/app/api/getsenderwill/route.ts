import { connectToDatabase } from '@/lib/db';
import WillModal from '@/models/will';

export async function GET(request: Request) {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const publicKey = searchParams.get('sender');

    try {
        const wills = await WillModal.find(
            { sender: publicKey },
            'message reciver sender amount duration -_id'
        );

        return new Response(JSON.stringify(wills), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching wills:', error);
        return Response.json(
            {
                success: false,
                message: 'Failed to fetch wills',
            },
            { status: 500 }
        );
    }
}
