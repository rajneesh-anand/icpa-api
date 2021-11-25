const express = require("express");
const { IncomingForm } = require("formidable");
const prisma = require("../lib/prisma");
const router = express.Router();

router.post("/", async (req, res, next) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.multiples = true;
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  try {
    await prisma.faq.create({
      data: {
        title: data.fields.title,
        description: data.fields.description,
        status: JSON.parse(data.fields.status),
      },
    });

    return res.status(200).json({
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
  const faqId = req.params.id;
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
  console.log(faqId);
  console.log(data);
  try {
    await prisma.faq.update({
      where: { id: Number(faqId) },
      data: {
        title: data.fields.title,
        description: data.fields.description,
        status: JSON.parse(data.fields.status),
      },
    });

    return res.status(200).json({
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

module.exports = router;
