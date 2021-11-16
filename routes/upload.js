const express = require("express");
const { IncomingForm } = require("formidable");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const uploadFolder = path.join(__dirname, "../upload");

router.post("/", async (req, res) => {
  console.log(uploadFolder);
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  console.log(data);
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

module.exports = router;
