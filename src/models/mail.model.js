const { getDB } = require("../config/db");

function mailsCollection() {
  return getDB().collection("mails");
}

async function saveMail({ from, to, raw }) {
  return mailsCollection().insertOne({
    from,
    to,
    raw,
    receivedAt: new Date(),
  });
}

module.exports = {
  saveMail,
};
