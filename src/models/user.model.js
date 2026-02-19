const User = require("./user.schema"); // mongoose model

async function findActiveUserByEmail(email) {
    return User.findOne({ email, active: true });
}

async function createUser({ email, active = true, system = false }) {
    return User.create({
        email,
        active,
        system,
        createdAt: new Date(),
    });
}

module.exports = {
    findActiveUserByEmail,
    createUser,
};
