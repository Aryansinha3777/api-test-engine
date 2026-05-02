const express = require("express");
const router = express.Router();
const { serveMock } = require("../controllers/mockServerController");

router.use(serveMock);

module.exports = router;