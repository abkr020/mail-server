require("dotenv").config();
const { connectDB } = require("./config/db");
const { createSMTPServer } = require("./smtp/smtpServer");

async function start() {
  await connectDB(process.env.MONGO_URI, process.env.DB_NAME);

  const server = createSMTPServer();

  server.listen(process.env.SMTP_PORT, () => {
    console.log(
      `🚀 SMTP server running on port ${process.env.SMTP_PORT}`
    );
  });
}

start().catch(err => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
