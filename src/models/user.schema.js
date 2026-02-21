const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(

    {
        name: {
            type: String,
            // required: true
        },

        email: { type: String, required: true, unique: true },
        password: { type: String }, // Optional for Google users
        // googleId: { type: String },
        picture: { type: String },
        // provider: { type: String, enum: ["local", "google"], default: "local" },
        // ✅ Store only address IDs
        // addresses: [
        //   {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Address",
        //   },
        // ],

        // ✅ Store only order IDs
        // orders: [
        //   {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Order",
        //   },
        // ],
        active: {
            type: Boolean,
            default: true,
        },
        system: {
            type: Boolean,
            default: false, // auto-created mailbox?
        },


        // email: {
        //     type: String,
        //     required: true,
        //     unique: true,
        //     // lowercase: true,
        //     // index: true,
        // },
        // active: {
        //     type: Boolean,
        //     default: true,
        // },
        // system: {
        //     type: Boolean,
        //     default: false, // auto-created mailbox?
        // },
        // createdAt: {
        //     type: Date,
        //     default: Date.now,
        // },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
