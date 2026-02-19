const mongoose = require("mongoose");

async function connectDB(uri, dbName) {
    if (!uri) throw new Error("MONGO_URI missing");
    if (!dbName) throw new Error("DB_NAME missing");

    mongoose.set("bufferCommands", false); // 🚨 critical for SMTP

    await mongoose.connect(uri, {
        dbName,
        serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB (Mongoose) connected");
}

module.exports = connectDB;
