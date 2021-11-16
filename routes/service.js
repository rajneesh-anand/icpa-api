const express = require("express");
const { IncomingForm } = require("formidable");
const fs = require("fs");
const prisma = require("../lib/prisma");
const AWS = require("aws-sdk");
const router = express.Router();

const bucketName = process.env.S3_BUCKET;

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_ACCESS_SECRET,
  region: process.env.AWS_REGISN,
});

const s3 = new AWS.S3();

const readFile = async (file) => {
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
    let resData = await uploadRes;
    return resData.Location;
  } catch (error) {
    return error;
  }
};

// const uploadPhototToawsS3 = async (data) => {
//   const images = data.files.images;
//   if (Array.isArray(images)) {
//     const promises = images.map((item) => readFile(item));
//     await Promise.all(promises);
//     return { message: "success" };
//   } else {
//     readFile(images);
//     return { message: "success" };
//   }
// };

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
  if (Object.keys(data.files).length !== 0) {
    const imageLocation = await readFile(data.files.images);
    try {
      await prisma.services.create({
        data: {
          serviceName: data.fields.service_name,
          slug: data.fields.slug,
          images: imageLocation,
          description: data.fields.description,
          serviceFee: Number(data.fields.service_fee),
          saleFee: Number(data.fields.sale_fee),
          discount: Number(data.fields.discount),
          gst: Number(data.fields.gst),
          usage: data.fields.usage,
          popularity: data.fields.popularity,
          status: JSON.parse(data.fields.status),
          category: { connect: { name: data.fields.category } },
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
      await prisma.services.create({
        data: {
          serviceName: data.fields.service_name,
          slug: data.fields.slug,
          description: data.fields.description,
          serviceFee: Number(data.fields.service_fee),
          saleFee: Number(data.fields.sale_fee),
          discount: Number(data.fields.discount),
          gst: Number(data.fields.gst),
          usage: data.fields.usage,
          popularity: data.fields.popularity,
          status: JSON.parse(data.fields.status),
          category: { connect: { name: data.fields.category } },
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

router.post("/:id", async (req, res, next) => {
  const serviceId = req.params.id;
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  if (Object.keys(data.files).length !== 0) {
    const imageLocation = await readFile(data.files.images);

    try {
      await prisma.services.update({
        where: { id: Number(serviceId) },
        data: {
          serviceName: data.fields.service_name,
          slug: data.fields.slug,
          images: imageLocation,
          description: data.fields.description,
          serviceFee: Number(data.fields.service_fee),
          saleFee: Number(data.fields.sale_fee),
          discount: Number(data.fields.discount),
          gst: Number(data.fields.gst),
          usage: data.fields.usage,
          status: JSON.parse(data.fields.status),
          popularity: data.fields.popularity,
          category: { connect: { name: data.fields.category } },
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
      await prisma.services.update({
        where: { id: Number(serviceId) },
        data: {
          serviceName: data.fields.service_name,
          slug: data.fields.slug,
          description: data.fields.description,
          serviceFee: Number(data.fields.service_fee),
          saleFee: Number(data.fields.sale_fee),
          discount: Number(data.fields.discount),
          gst: Number(data.fields.gst),
          usage: data.fields.usage,
          status: JSON.parse(data.fields.status),
          popularity: data.fields.popularity,
          category: { connect: { name: data.fields.category } },
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
