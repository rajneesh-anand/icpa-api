const express = require("express");
const { IncomingForm } = require("formidable");
const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");
const DatauriParser = require("datauri/parser");
const cloudinary = require("cloudinary").v2;

const router = express.Router();
const parser = new DatauriParser();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUpload = (file) => cloudinary.uploader.upload(file);

router.post("/", async (req, res, next) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  console.log(data);

  if (Object.keys(data.files).length !== 0) {
    const photo = await fs.promises
      .readFile(data.files.image.path)
      .catch((err) => console.error("Failed to read file", err));

    let photo64 = parser.format(
      path.extname(data.files.image.name).toString(),
      photo
    );
    const uploadResult = await cloudinaryUpload(photo64.content);

    try {
      const result = await prisma.post.create({
        data: {
          title: data.fields.title,
          slug: data.fields.slug,
          content: data.fields.content,
          template: data.fields.template,
          category: data.fields.category,
          tags: JSON.parse(data.fields.tags),
          subCategories: JSON.parse(data.fields.subCategories),
          published: JSON.parse(data.fields.published),
          image: uploadResult.secure_url,
          author: { connect: { email: data.fields.author } },
        },
      });

      res.status(200).json({
        msg: "success",
        data: result,
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
      const result = await prisma.post.create({
        data: {
          title: data.fields.title,
          slug: data.fields.slug,
          content: data.fields.content,
          template: data.fields.template,
          category: data.fields.category,
          tags: JSON.parse(data.fields.tags),
          subCategories: JSON.parse(data.fields.subCategories),
          published: JSON.parse(data.fields.published),
          author: { connect: { email: data.fields.author } },
        },
      });

      res.status(200).json({
        msg: "success",
        data: result,
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
  const postId = req.params.id;
  console.log(postId);
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  if (Object.keys(data.files).length !== 0) {
    const photo = await fs.promises
      .readFile(data.files.image.path)
      .catch((err) => console.error("Failed to read file", err));

    let photo64 = parser.format(
      path.extname(data.files.image.name).toString(),
      photo
    );
    const uploadResult = await cloudinaryUpload(photo64.content);

    try {
      let result = await prisma.post.update({
        where: { id: Number(postId) },
        data: {
          title: data.fields.title,
          slug: data.fields.slug,
          content: data.fields.content,
          template: data.fields.template,
          category: data.fields.category,
          tags: JSON.parse(data.fields.tags),
          subCategories: JSON.parse(data.fields.subCategories),
          published: JSON.parse(data.fields.published),
          image: uploadResult.secure_url,
          author: { connect: { email: data.fields.author } },
        },
      });

      res.status(200).json({
        msg: "success",
        data: result,
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
      let result = await prisma.post.update({
        where: { id: Number(postId) },
        data: {
          title: data.fields.title,
          slug: data.fields.slug,
          content: data.fields.content,
          template: data.fields.template,
          category: data.fields.category,
          tags: JSON.parse(data.fields.tags),
          subCategories: JSON.parse(data.fields.subCategories),
          published: JSON.parse(data.fields.published),
          author: { connect: { email: data.fields.author } },
        },
      });

      res.status(200).json({
        msg: "success",
        data: result,
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
