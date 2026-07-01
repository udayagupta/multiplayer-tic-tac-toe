const crypto = require("crypto");

module.exports = generateRoomCode = (rooms, length = 6) => {
  let code = "";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  do {
    code = "";
    for (let i = 0; i < length; i++) {
      const index = crypto.randomInt(chars.length);
      code += chars[index];
    }
  } while (!rooms[code]);

  return code;
};
