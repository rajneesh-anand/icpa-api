const express = require("express");
const { IncomingForm } = require("formidable");
const fs = require("fs");
const prisma = require("../lib/prisma");
const router = express.Router();
var AWS = require("aws-sdk");
const bcrypt = require("bcrypt");

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
    Bucket: bucketName + "/users",
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

const hashedPassword = (password) => {
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) {
      console.log(err);
    }
    return hash;
  });
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

  const user = await prisma.users.findFirst({
    where: {
      email: data.fields.email,
    },
  });

  if (user) {
    return res.status(200).json({ msg: "User already exist" });
  }

  const hashPassword = bcrypt.hashSync(data.fields.password, 10);
  console.log(hashPassword);
  try {
    await prisma.user.create({
      data: {
        name: data.fields.name,
        email: data.fields.email,
        password: hashPassword,
        userType: data.fields.type,
        status: data.fields.status,
        image:
          Object.keys(data.files).length !== 0
            ? await readFile(data.files.images)
            : null,
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

router.post("/signin", async (req, res, next) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.multiples = true;
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
  console.log(data);

  const userPwd = await prisma.user.findUnique({
    where: {
      email: data.fields.email,
    },
    select: {
      password: true,
    },
  });

  if (!userPwd) {
    return res.status(403).json({ msg: "Email address does not exist !" });
  }
  console.log(userPwd);

  const pwdMatch = bcrypt.compareSync(data.fields.password, userPwd.password);
  console.log(pwdMatch);

  if (pwdMatch) {
    return res.status(200).json({ msg: "success" });
  } else {
    return res.status(403).json({ msg: "Password is wrong !" });
  }
});

router.post("/forgotpwd", async (req, res, next) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.multiples = true;
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  const userPwd = await prisma.user.findUnique({
    where: {
      email: data.fields.email,
    },
    select: {
      password: true,
    },
  });

  if (!userPwd) {
    return res.status(403).json({ msg: "Email address does not exist !" });
  }
  console.log(userPwd);

  const pwdMatch = bcrypt.compareSync(data.fields.password, userPwd.password);
  console.log(pwdMatch);

  if (pwdMatch) {
    return res.status(200).json({ msg: "success" });
  } else {
    return res.status(403).json({ msg: "Password is wrong !" });
  }
});

module.exports = router;
