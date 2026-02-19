require("dotenv").config();

const { connectDB } = require("./config/db");
const { createSMTPServer } = require("./smtp/smtpServer");

async function start() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("❌ MONGO_URI not set");
        }

        if (!process.env.DB_NAME) {
            throw new Error("❌ DB_NAME not set");
        }

        if (!process.env.SMTP_PORT) {
            throw new Error("❌ SMTP_PORT not set");
        }

        // ⬅️ BLOCKING: SMTP will not start unless DB is connected
        await connectDB(process.env.MONGO_URI, process.env.DB_NAME);

        const server = createSMTPServer();

        server.listen(process.env.SMTP_PORT, () => {
            console.log("🚀 SMTP server running");
            console.log("📬 Port:", process.env.SMTP_PORT);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        });
    } catch (err) {
        console.error("❌ Failed to start server");
        console.error(err);
        process.exit(1);
    }
}

start();
