const Mail = require("./mail.schema");

async function saveMail({ from, to, raw }) {
    return Mail.create({
        from,
        to,
        raw,
    });
}

module.exports = { saveMail };
