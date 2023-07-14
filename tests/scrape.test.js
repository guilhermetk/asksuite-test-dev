const request = require("supertest");
const express = require("express");
const router = require("../routes/router");

const app = new express();
app.use(express.json());
app.use("/", router);
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

jest.setTimeout(20000);

describe("test routes", function () {
  test("responds with a hello world text to get / ", async () => {
    const res = await request(app).get("/");
    expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual("Hello Asksuite World!");
  });

  test("responds with an error to post /search if checkin is not a valid date", async () => {
    const res = await request(app)
      .post("/search")
      .send({ checkin: "2022-12-XX", checkout: "2022-12-21" });
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(400);
  });

  test("responds with an error to post /search if checkout is not a valid date", async () => {
    const res = await request(app)
      .post("/search")
      .send({ checkin: "2022-12-01", checkout: "2022-12-XX" });
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(400);
  });

  test("responds with an error if checkin and checkout dates are before current date", async () => {
    const res = await request(app)
      .post("/search")
      .send({ checkin: "2022-12-01", checkout: "2022-12-03" });
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(422);
    expect(JSON.parse(res.text).message).toEqual(
      "No rooms found, try again with different dates."
    );
  });

  test("responds with an array of rooms if date range is valid", async () => {
    const res = await request(app)
      .post("/search")
      .send({ checkin: "2023-10-01", checkout: "2023-10-05" });
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.text).length > 0);
  });

  //   test("responds to /hello/Annie", async () => {
  //     const res = await request(app).get("/hello/Annie");
  //     expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
  //     expect(res.statusCode).toBe(200);
  //     expect(res.text).toEqual("hello Annie!");
  //   });
});
