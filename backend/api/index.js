// Vercel looks inside /api for serverless functions.
// This file simply re-exports our existing Express app so all the
// real logic stays in server.js (and local `node server.js` still works).
module.exports = require("../server.js");