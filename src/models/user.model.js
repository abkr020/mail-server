const { getDB } = require("../config/db");

function usersCollection() {
  return getDB().collection("users");
}

async function findActiveUserByEmail(email) {
  return usersCollection().findOne({
    email: email.toLowerCase(),
    active: true,
  });
}

module.exports = {
  findActiveUserByEmail,
};
