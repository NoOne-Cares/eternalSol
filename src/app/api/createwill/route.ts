import { connectToDatabase } from "@/lib/db";
import WillModal from "@/models/will";


export async function PUT(request: Request) {
    await connectToDatabase();

    try {
        const body = await request.json();
        const { message, sender, reciver, duration, transaction, amount } = body;

        const existingWill = await WillModal.findOne({ sender, reciver });
        if (existingWill) {
            return new Response(JSON.stringify({
                success: false,
                message: "You can't create will for same reciver address"
            }), { status: 409 });
        }


        const newWill = new WillModal({
            message,
            sender,
            reciver,
            duration,
            transaction,
            amount,
        });

        await newWill.save();

        return new Response(JSON.stringify({ success: true, message: "will created successfully" }), {
            status: 201,
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: error }), {
            status: 500,
        });
    }
}
