const mongoose = require("mongoose");

const mailSchema = new mongoose.Schema({
    from: String,
    to: String,
    raw: String,

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Mail", mailSchema);
