const { SMTPServer } = require("smtp-server");
const { findActiveUserByEmail } = require("../models/user.model");
const { saveMail } = require("../models/mail.model");

function createSMTPServer() {
  return new SMTPServer({
    allowInsecureAuth: true,
    authOptional: true,

    onConnect(session, cb) {
      console.log("🔌 CONNECT:", session.id);
      cb();
    },

    onMailFrom(address, session, cb) {
      session.mailFrom = address.address;
      console.log("📤 MAIL FROM:", address.address);
      cb();
    },

    async onRcptTo(address, session, cb) {
      const recipient = address.address.toLowerCase();
      console.log("📥 RCPT TO:", recipient);

      try {
        const user = await findActiveUserByEmail(recipient);

        if (!user) {
          return cb(new Error("550 5.1.1 No such user"));
        }

        session.user = user;
        cb();
      } catch (err) {
        console.error("❌ RCPT error:", err);
        cb(new Error("451 Temporary server error"));
      }
    },

    onData(stream, session, cb) {
      let raw = "";

      stream.on("data", chunk => {
        raw += chunk.toString();
      });

      stream.on("end", async () => {
        try {
          await saveMail({
            from: session.mailFrom,
            to: session.user.email,
            raw,
          });

          console.log("📦 Mail stored for:", session.user.email);
          cb();
        } catch (err) {
          console.error("❌ Store mail failed:", err);
          cb(new Error("451 Mail processing failed"));
        }
      });
    },
  });
}

module.exports = { createSMTPServer };
