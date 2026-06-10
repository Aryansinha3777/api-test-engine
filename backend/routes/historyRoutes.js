const express = require("express");
const router = express.Router();
const { getHistory, clearHistory } = require("../controllers/historyController");

router.get("/", getHistory);
router.delete("/", clearHistory);

module.exports = router;