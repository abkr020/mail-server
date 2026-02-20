const { SMTPServer } = require("smtp-server");
const { simpleParser } = require("mailparser");
const {
    findActiveUserByEmail,
    createUser,
} = require("../models/user.model");
const { saveMail } = require("../models/mail.model");
const logger = require("../utils/logger");

const AUTO_CREATE_EMAIL = "hi@slvai.tech";

function createSMTPServer() {
    return new SMTPServer({
        disabledCommands: ["STARTTLS"],   // 🔥 prevent TLS crashes
        allowInsecureAuth: true,
        authOptional: true,
        logger: false,
        size: 10 * 1024 * 1024,           // 🔒 10MB limit

        /* ───────── CONNECT ───────── */
        onConnect(session, cb) {
            session.startTime = Date.now();

            logger.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            logger.log("🔌 CONNECT");
            logger.log("🆔 Session ID :", session.id);
            logger.log("🌍 Remote IP :", session.remoteAddress);
            logger.log("🕒 Time       :", new Date().toISOString());
            logger.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            cb();
        },

        /* ───────── MAIL FROM ───────── */
        onMailFrom(address, session, cb) {
            session.mailFrom = address.address;

            logger.log("📤 MAIL FROM", address.address, session.id);
            cb();
        },

        /* ───────── RCPT TO ───────── */
        async onRcptTo(address, session, cb) {
            const recipient = address.address.toLowerCase();

            logger.log("📥 RCPT TO", recipient, session.id);

            try {
                let user = await findActiveUserByEmail(recipient);

                if (!user && recipient === AUTO_CREATE_EMAIL) {
                    logger.warn("⚠️ AUTO-CREATING USER", recipient);

                    user = await createUser({
                        email: recipient,
                        active: true,
                        system: true,
                    });

                    logger.log("✅ USER AUTO-CREATED", user._id.toString());
                }

                if (!user) {
                    logger.warn("❌ RCPT REJECTED", recipient);
                    return cb(new Error("550 5.1.1 No such user"));
                }

                session.user = user;
                logger.log("✅ RCPT ACCEPTED", user._id.toString());
                cb();
            } catch (err) {
                logger.error("❌ RCPT ERROR", err);
                cb(new Error("451 Temporary server error"));
            }
        },

        /* ───────── DATA ───────── */
        onData(stream, session, cb) {
            if (!session.user) {
                logger.error("❌ DATA without valid session");
                return cb(new Error("554 Invalid session"));
            }

            logger.log("📨 DATA START", session.id);

            simpleParser(stream)
                .then(async parsed => {
                    const mailData = {
                        envelopeFrom: session.mailFrom,
                        headerFrom: parsed.from?.text || session.mailFrom,
                        to: session.user.email.toLowerCase(),

                        subject: parsed.subject || "(no subject)",
                        text: parsed.text || "",
                        html:
                            typeof parsed.html === "string"
                                ? parsed.html
                                : parsed.html?.toString() || "",

                        messageId: parsed.messageId,
                        date: parsed.date || new Date(),

                        attachments: (parsed.attachments || []).map(att => ({
                            filename: att.filename,
                            contentType: att.contentType,
                            size: att.size,
                        })),
                    };

                    await saveMail(mailData);

                    const duration = Date.now() - session.startTime;

                    logger.log("📦 MAIL STORED");
                    logger.log("   To:", mailData.to);
                    logger.log("   Subject:", mailData.subject);
                    logger.log("   Attachments:", mailData.attachments.length);
                    logger.log("   Duration:", duration, "ms");
                    logger.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

                    cb();
                })
                .catch(err => {
                    logger.error("❌ MAIL PARSE FAILED", err);
                    cb(new Error("451 Mail processing failed"));
                });
        },

        /* ───────── CLOSE ───────── */
        onClose(session) {
            logger.log("🔒 CONNECTION CLOSED", session.id);
            logger.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        },
    });
}

module.exports = { createSMTPServer };