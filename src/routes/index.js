const express = require("express");
const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

router.use("/auth", require("./auth.routes"));
router.use("/projects", require("./project.routes"));

router.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports = router;
