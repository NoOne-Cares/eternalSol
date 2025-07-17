import mongoose, { Document, NumberExpression, Schema } from "mongoose";

export interface Will extends Document {
    message: string;
    sender: string;
    reciver: string;
    duration: number;
    transaction: string;
    amount: number;
}

const WillSchema: Schema<Will> = new Schema({
    message: {
        type: String,
        required: true,
    },

    sender: {
        type: String,
        required: true,
    },
    reciver: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    transaction: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    }
})

const WillModal = (mongoose.models.Will as mongoose.Model<Will>) || mongoose.model<Will>("Will", WillSchema)
export default WillModal