import mongoose from "mongoose";

const MONGODB_URI = process.env.MONOGODB_URL!

if (!MONGODB_URI) {
    throw new Error("Mongo DB uri missing")
}


let cache = global.mongoose;

if (!cache) {
    cache = global.mongoose = { con: null, promise: null }
}

export const connectToDatabase = async () => {
    if (cache.con) cache.con;
    if (!cache.promise) {
        mongoose
            .connect(MONGODB_URI)
            .then(() => mongoose.connection)
    }
    try {
        cache.con = await cache.promise
    } catch (error) {
        cache.promise = null
        throw new Error("Connection Failled")
    }
    return cache.con;
}