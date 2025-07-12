import { connectToDatabase } from "@/lib/db";
import WillModal from "@/models/will";

export async function DELETE(request: Request) {
    await connectToDatabase();

    try {
        const body = await request.json();
        const { sender, reciver } = body;

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
        return new Response(JSON.stringify({ success: false, message: "Failed to delete will" }), {
            status: 500,
        });
    }
}
