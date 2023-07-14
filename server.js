require("dotenv").config();
const express = require("express");
const router = require("./routes/router");

const app = express();
app.use(express.json());

const port = process.env.PORT;

app.use("/", router);
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

app.listen(port || 8080, () => {
  console.log(`Listening on port ${port}`);
});
