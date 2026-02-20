const Mail = require("./mail.schema");

async function saveMail(mailData) {
  return Mail.create(mailData);
}

module.exports = { saveMail };