import { connectToDatabase } from "@/lib/db";
import WillModal from "@/models/will";

export async function DELETE(request: Request) {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const reciver = searchParams.get('reciver');
    const sender = searchParams.get('sender');

    if (sender && reciver) {
        try {
            const result = await WillModal.findOneAndDelete({ sender, reciver });

            if (!result) {
                return new Response(JSON.stringify({
                    success: false,
                    message: "No will found for the given sender and receiver."
                }), {
                    status: 404,
                });
            }
            return new Response(JSON.stringify({ success: true, message: "Will deleted successfully." }), {
                status: 200,
            });
        } catch (error) {
            return new Response(JSON.stringify({ success: false, message: error }), {
                status: 500,
            });
        }
    } else {
        return new Response(JSON.stringify({ success: false, message: "failed to parse parameeters" }), {
            status: 500,
        });
    }
}
