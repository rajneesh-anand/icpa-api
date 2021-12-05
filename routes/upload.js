const express = require("express");
const { IncomingForm } = require("formidable");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// const uploadFolder = path.join(__dirname, "../upload");

router.post("/franchise", async (req, res) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  const rawData = fs.readFileSync(data.files.uploadedFile.path);

  try {
    fs.writeFile(
      path.join(__dirname, `../upload/${data.files.uploadedFile.name}`),
      rawData,
      function (err) {
        if (err) console.log(err);
        return res.status(200).json({
          status: "success",
          message: "File uploaded successfully",
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

router.post("/plan", async (req, res) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  const rawData = fs.readFileSync(data.files.uploadedFile.path);

  try {
    fs.writeFile(
      path.join(__dirname, `../upload/${data.files.uploadedFile.name}`),
      rawData,
      function (err) {
        if (err) console.log(err);
        return res.status(200).json({
          status: "success",
          message: "File uploaded successfully",
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

router.post("/category", async (req, res) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  const rawData = fs.readFileSync(data.files.uploadedFile.path);

  try {
    fs.writeFile(
      path.join(__dirname, `../upload/${data.files.uploadedFile.name}`),
      rawData,
      function (err) {
        if (err) console.log(err);
        return res.status(200).json({
          status: "success",
          message: "File uploaded successfully",
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

router.post("/about", async (req, res) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  const rawData = fs.readFileSync(data.files.uploadedFile.path);

  try {
    fs.writeFile(
      path.join(__dirname, `../upload/${data.files.uploadedFile.name}`),
      rawData,
      function (err) {
        if (err) console.log(err);
        return res.status(200).json({
          status: "success",
          message: "File uploaded successfully",
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

router.get("/franchise", async (req, res) => {
  res.header("Content-Type", "application/json");
  res.sendFile(path.join(__dirname, "../upload/franchise.json"));
});

router.get("/plan", async (req, res) => {
  res.header("Content-Type", "application/json");
  res.sendFile(path.join(__dirname, "../upload/membership-plan.json"));
});

router.get("/category", async (req, res) => {
  res.header("Content-Type", "application/json");
  res.sendFile(path.join(__dirname, "../upload/product-category.json"));
});

router.get("/about", async (req, res) => {
  res.header("Content-Type", "application/json");
  res.sendFile(path.join(__dirname, "../upload/about.json"));
});

module.exports = router;
