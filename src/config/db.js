const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDB(uri, dbName) {
    if (db) return db;

    if (!uri) throw new Error("MONGO_URI is missing");
    if (!dbName) throw new Error("DB_NAME is missing");

    client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
    });

    await client.connect();

    db = client.db(dbName);

    console.log("✅ MongoDB connected");
    console.log("📦 Database:", dbName);

    return db;
}

function getDB() {
    if (!db) {
        throw new Error("❌ Database not initialized");
    }
    return db;
}

module.exports = {
    connectDB,
    getDB,
};
