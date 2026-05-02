const express = require("express");
const router = express.Router();
const { testRequest } = require("../controllers/testController");

router.post("/", testRequest);

module.exports = router;