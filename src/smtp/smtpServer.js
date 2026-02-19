const { SMTPServer } = require("smtp-server");
const {
    findActiveUserByEmail,
    createUser,
} = require("../models/user.model");
const { saveMail } = require("../models/mail.model");

const AUTO_CREATE_EMAIL = "hi@slvai.tech";

function createSMTPServer() {
    return new SMTPServer({
        allowInsecureAuth: true,
        authOptional: true,
        logger: false,

        /* ───────── CONNECT ───────── */
        onConnect(session, cb) {
            session.startTime = Date.now();

            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("🔌 CONNECT");
            console.log("🆔 Session ID :", session.id);
            console.log("🌍 Remote IP :", session.remoteAddress);
            console.log("🕒 Time       :", new Date().toISOString());
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            cb();
        },

        /* ───────── MAIL FROM ───────── */
        onMailFrom(address, session, cb) {
            session.mailFrom = address.address;

            console.log("📤 MAIL FROM");
            console.log("   From :", address.address);
            console.log("   Session :", session.id);

            cb();
        },

        /* ───────── RCPT TO ───────── */
        async onRcptTo(address, session, cb) {
            const recipient = address.address.toLowerCase();

            console.log("📥 RCPT TO");
            console.log("   To :", recipient);
            console.log("   Session :", session.id);

            try {
                let user = await findActiveUserByEmail(recipient);

                /* 🔹 Special auto-create rule */
                if (!user && recipient === AUTO_CREATE_EMAIL) {
                    console.warn("⚠️  USER NOT FOUND — AUTO CREATING");
                    console.warn("   Email :", recipient);

                    user = await createUser({
                        email: recipient,
                        active: true,
                        system: true,
                    });

                    console.log("✅ USER AUTO-CREATED");
                    console.log("   User ID :", user._id.toString());
                }

                if (!user) {
                    console.warn("⚠️  RCPT REJECTED (user not found)");
                    console.warn("   Recipient :", recipient);

                    return cb(new Error("550 5.1.1 No such user"));
                }

                session.user = user;

                console.log("✅ RCPT ACCEPTED");
                console.log("   User ID :", user._id.toString());

                cb();
            } catch (err) {
                console.error("❌ RCPT LOOKUP / CREATE FAILED");
                console.error(err);

                cb(new Error("451 Temporary server error"));
            }
        },

        /* ───────── DATA ───────── */
        onData(stream, session, cb) {
            console.log("📨 DATA START");
            console.log("   Session :", session.id);

            let raw = "";
            let size = 0;

            stream.on("data", chunk => {
                size += chunk.length;
                raw += chunk.toString();
            });

            stream.on("end", async () => {
                console.log("📨 DATA END");
                console.log("   Size :", size, "bytes");

                try {
                    await saveMail({
                        from: session.mailFrom,
                        to: session.user.email,
                        raw,
                    });

                    const duration = Date.now() - session.startTime;

                    console.log("📦 MAIL STORED SUCCESSFULLY");
                    console.log("   To :", session.user.email);
                    console.log("   Duration :", duration, "ms");
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

                    cb();
                } catch (err) {
                    console.error("❌ MAIL STORAGE FAILED");
                    console.error(err);

                    cb(new Error("451 Mail processing failed"));
                }
            });

            stream.on("error", err => {
                console.error("❌ STREAM ERROR");
                console.error(err);
            });
        },

        /* ───────── CLOSE ───────── */
        onClose(session) {
            console.log("🔒 CONNECTION CLOSED");
            console.log("   Session :", session.id);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        },
    });
}

module.exports = { createSMTPServer };
