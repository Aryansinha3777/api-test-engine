const express = require("express");
const router = express.Router();
const {
  getAllMocks,
  getMockById,
  createMock,
  updateMock,
  deleteMock,
  resetHits,
} = require("../controllers/mockController");

router.get("/",              getAllMocks);
router.get("/:id",           getMockById);
router.post("/",             createMock);
router.put("/:id",           updateMock);
router.delete("/:id",        deleteMock);
router.patch("/:id/reset-hits", resetHits);

module.exports = router;