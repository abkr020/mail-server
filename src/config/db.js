const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDB(uri, dbName) {
  if (db) return db;

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);
  console.log("✅ MongoDB connected");

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
