const express = require("express");
const scrapeController = require("../controller/scrape");
const { body } = require("express-validator");

const router = express.Router();

router.get("/", scrapeController.getRoot);

router.post(
  "/search",
  [
    body("checkin").isDate().withMessage("Invalid checkin date."),
    body("checkout").isDate().withMessage("Invalid checkout date."),
  ],
  scrapeController.postSearch
);

module.exports = router;
