require("dotenv").config();
const connectDB = require("./config/db");
const { createSMTPServer } = require("./smtp/smtpServer");
const logger = require("./utils/logger");

process.on("uncaughtException", err => {
    logger.error("🔥 UNCAUGHT EXCEPTION", err);
});

process.on("unhandledRejection", err => {
    logger.error("🔥 UNHANDLED PROMISE", err);
});

async function start() {
    try {
        await connectDB(process.env.MONGO_URI, process.env.DB_NAME);

        const server = createSMTPServer();

        // 🔥 critical: prevents server from stopping
        server.on("error", err => {
            logger.error("🔥 SMTP SERVER ERROR", err);
        });

        server.listen(process.env.SMTP_PORT, () => {
            logger.log(`🚀 SMTP server running on port ${process.env.SMTP_PORT}`);
        });
    } catch (err) {
        logger.error("❌ Failed to start server", err);
        process.exit(1);
    }
}

start();