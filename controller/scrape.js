const scraperFunction = require("../functions/scrape");
const { validationResult } = require("express-validator");

exports.getRoot = (req, res) => {
  res.send("Hello Asksuite World!");
};

exports.postSearch = async (req, res, next) => {
  const { checkin, checkout } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const response = await scraperFunction.scrape(checkin, checkout);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
