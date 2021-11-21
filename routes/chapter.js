const express = require("express");
const { IncomingForm } = require("formidable");
const fs = require("fs");
const prisma = require("../lib/prisma");
const router = express.Router();

var AWS = require("aws-sdk");

const bucketName = process.env.S3_BUCKET;

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_ACCESS_SECRET,
  region: process.env.AWS_REGISN,
});

const s3 = new AWS.S3();

var awsImagePath = [];

const readFile = async (file) => {
  const photo = await fs.promises.readFile(file.path).catch((err) => {
    console.error("Failed to read file", err);
  });
  const params = {
    Bucket: bucketName + "/lectures",
    Key: file.name,
    ContentType: file.type,
    Body: photo,
    ACL: "public-read",
  };

  try {
    let uploadRes = s3.upload(params).promise();
    let resData = await uploadRes;
    return resData.Location;
  } catch (error) {
    return error;
  }
};

const uploadPhototToawsS3 = async (data) => {
  const images = data.files.images;
  if (Array.isArray(images)) {
    const promises = images.map((item) => readFile(item));
    await Promise.all(promises);
    return { message: "success" };
  } else {
    readFile(images);
    return { message: "success" };
  }
};

router.post("/", async (req, res, next) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.multiples = true;
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  const imageLocation = await readFile(data.files.image);
  const videoLocation = await readFile(data.files.video);
  try {
    await prisma.coursemedia.create({
      data: {
        title: data.fields.name,
        module: data.fields.module,
        slug: data.fields.slug,
        description: data.fields.description,
        video: videoLocation,
        poster: imageLocation,
        course: { connect: { courseName: data.fields.course_name } },
      },
    });
    res.status(200).json({
      msg: "success",
    });
  } catch (error) {
    console.log(error);
    return next(error);
  } finally {
    async () => {
      await prisma.$disconnect();
    };
  }
});

router.post("/:id", async (req, res, next) => {
  const chapterId = req.params.id;
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  if (Object.keys(data.files).length !== 0) {
    const imageLocation = await readFile(data.files.image);
    const videoLocation = await readFile(data.files.video);

    try {
      await prisma.coursemedia.update({
        where: { id: Number(chapterId) },
        data: {
          title: data.fields.name,
          module: data.fields.module,
          slug: data.fields.slug,
          description: data.fields.description,
          video: videoLocation,
          poster: imageLocation,
          course: { connect: { courseName: data.fields.course_name } },
        },
      });

      res.status(200).json({
        msg: "success",
      });
    } catch (error) {
      console.log(error);
      return next(error);
    } finally {
      async () => {
        await prisma.$disconnect();
      };
    }
  } else {
    try {
      await prisma.coursemedia.update({
        where: { id: Number(chapterId) },
        data: {
          title: data.fields.name,
          module: data.fields.module,
          slug: data.fields.slug,
          description: data.fields.description,
          course: { connect: { courseName: data.fields.course_name } },
        },
      });
      res.status(200).json({
        msg: "success",
      });
    } catch (error) {
      console.log(error);
      return next(error);
    } finally {
      async () => {
        await prisma.$disconnect();
      };
    }
  }
});

module.exports = router;
