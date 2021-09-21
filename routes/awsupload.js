const express = require("express");
const fs = require("fs");
const router = express.Router();
var AWS = require("aws-sdk");
const { IncomingForm } = require("formidable");

const bucketName = process.env.S3_BUCKET;

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_ACCESS_SECRET,
  region: process.env.AWS_REGISN,
});

const s3 = new AWS.S3();

// function to read file from incoming form
const readFile = async (file) => {
  let awsImagePath = [];
  const photo = await fs.promises.readFile(file.path).catch((err) => {
    console.error("Failed to read file", err);
  });
  const params = {
    Bucket: bucketName + "/photos",
    Key: file.name,
    ContentType: file.type,
    Body: photo,
    ACL: "public-read",
  };

  try {
    let uploadRes = s3.upload(params).promise();
    let data = await uploadRes;
    console.log(data);
    awsImagePath.push(data.Location);
  } catch (error) {
    return error;
  }
};

// function to fetch list of objects from aws bucket
async function fetchObjects(bucketName) {
  console.log(`object`);
  let objects = [];
  const params = {
    Bucket: bucketName,
    // Delimiter: "/",
    Prefix: "photos/",
  };

  let listObject = s3.listObjectsV2(params).promise();
  let data = await listObject;

  data.Contents.forEach((content) => {
    return objects.push({
      key: content.Key,
      url: `https://${bucketName}.s3.amazonaws.com/${content.Key}`,
    });
  });
  return objects;
}

// function to delete an object from aws bucket
async function deleteObjects(bucketName, key) {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    await s3
      .deleteObject(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else {
          return data;
        }
      })
      .promise();
  } catch (e) {}
}

// function to upload an object to aws bucket
async function uploadObjects(data) {
  const images = data.files.images;
  if (Array.isArray(images)) {
    const promises = images.map((item) => readFile(item));
    await Promise.all(promises);
    return { message: "success" };
  } else {
    readFile(images);
    return { message: "success" };
  }
}

router.post("/", async (req, res, next) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.multiples = true;
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
  console.log(data);
  uploadObjects(data).then((pres) => {
    if (pres.message === "success") {
      res.status(200).json({ msg: "success" });
    } else {
      return next(error);
    }
  });
});

router.get("/fetchObject", (req, res, next) => {
  fetchObjects(bucketName)
    .then((content) => {
      console.log(content);
      res.status(200).json({ msg: "success", data: content });
    })
    .catch((err) => {
      console.log(err);
      return next(err);
    });
});

router.post("/deleteObject", async (req, res) => {
  const key = req.body.key;

  deleteObjects(bucketName, key)
    .then((content) => {
      res.status(200).json({ msg: "success", data: content });
    })
    .catch((err) => {
      console.log(err);
      return next(err);
    });
});

module.exports = router;
