const User = require("./user.schema");

/* Find active user */
async function findActiveUserByEmail(email) {
    return User.findOne({
        email: email.toLowerCase(),
        active: true,
    });
}

/* Create user (used for hi@slvai.tech auto-create) */
async function createUser({ email, active = true, system = false }) {
    return User.create({
        email: email.toLowerCase(),
        active,
        system,
    });
}

module.exports = {
    findActiveUserByEmail,
    createUser,
};
