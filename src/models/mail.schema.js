const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
    {
        filename: String,
        contentType: String,
        size: Number,
    },
    { _id: false }
);

const mailSchema = new mongoose.Schema({
    from: String,
    to: String,

    subject: String,
    text: String,
    html: String,

    messageId: String,
    date: Date,

    attachments: [attachmentSchema],

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Mail", mailSchema);