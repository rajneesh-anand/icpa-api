const express = require("express");
const cors = require("cors");
const upload = require("./routes/upload");
const publish = require("./routes/publish");
const post = require("./routes/post");
const product = require("./routes/product");
const video = require("./routes/video");
const awsupload = require("./routes/awsupload");
const service = require("./routes/service");
const course = require("./routes/course");
const chapter = require("./routes/chapter");
const testinomial = require("./routes/testinomial");
const blog = require("./routes/blog");
const payment = require("./routes/payment");
const auth = require("./routes/auth");
const faq = require("./routes/faq");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var allowedDomains = [
  "http://localhost:3000",
  "https://icpa-admin.vercel.app",
  "https://admin.icpaglobalconsultant.com",
  "https://icpa-mu.vercel.app",
  "https://www.icpaglobalconsultant.com",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedDomains.indexOf(origin) === -1) {
        var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
app.use("/api/auth", auth);
app.use("/api/upload", upload);
app.use("/api/publish", publish);
app.use("/api/post", post);
app.use("/api/product", product);
app.use("/api/video", video);
app.use("/api/awsupload", awsupload);
app.use("/api/service", service);
app.use("/api/course", course);
app.use("/api/chapter", chapter);
app.use("/api/testinomial", testinomial);
app.use("/api/blog", blog);
app.use("/api/payment", payment);
app.use("/api/faq", faq);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
