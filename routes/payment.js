const express = require("express");
const http = require("http");
const https = require("https");
const path = require("path");
const fs = require("fs");
const qs = require("querystring");

const router = express.Router();

const PaytmChecksum = require("../paytm/cheksum");
const PaytmConfig = require("../paytm/config");

router.post("/paynow", (req, res) => {
  let body = "";

  const orderId = "TEST_" + new Date().getTime();

  req
    .on("error", (err) => {
      console.error(err.stack);
    })
    .on("data", (chunk) => {
      body += chunk;
    })
    .on("end", () => {
      let data = qs.parse(body);

      const paytmParams = {};

      paytmParams.body = {
        requestType: "Payment",
        mid: PaytmConfig.PaytmConfig.mid,
        websiteName: PaytmConfig.PaytmConfig.website,
        orderId: orderId,
        callbackUrl: "http://localhost:8080/api/payment/callback",
        txnAmount: {
          value: data.amount,
          currency: "INR",
        },
        userInfo: {
          custId: data.email,
        },
      };

      PaytmChecksum.generateSignature(
        JSON.stringify(paytmParams.body),
        PaytmConfig.PaytmConfig.key
      ).then(function (checksum) {
        paytmParams.head = {
          signature: checksum,
        };

        var post_data = JSON.stringify(paytmParams);

        var options = {
          /* for Staging */
          hostname: "securegw-stage.paytm.in",

          /* for Production */
          // hostname: 'securegw.paytm.in',

          port: 443,
          path: `/theia/api/v1/initiateTransaction?mid=${PaytmConfig.PaytmConfig.mid}&orderId=${orderId}`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": post_data.length,
          },
        };

        var response = "";
        var post_req = https.request(options, function (post_res) {
          post_res.on("data", function (chunk) {
            response += chunk;
          });

          post_res.on("end", function () {
            response = JSON.parse(response);
            console.log("txnToken:", response);

            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(`<html>
                                <head>
                                    <title>Show Payment Page</title>
                                </head>
                                <body>
                                    <center>
                                        <h1>Please do not refresh this page...</h1>
                                    </center>
                                    <form method="post" action="https://securegw-stage.paytm.in/theia/api/v1/showPaymentPage?mid=${PaytmConfig.PaytmConfig.mid}&orderId=${orderId}" name="paytm">
                                        <table border="1">
                                            <tbody>
                                                <input type="hidden" name="mid" value="${PaytmConfig.PaytmConfig.mid}">
                                                    <input type="hidden" name="orderId" value="${orderId}">
                                                    <input type="hidden" name="txnToken" value="${response.body.txnToken}">
                                         </tbody>
                                      </table>
                                                    <script type="text/javascript"> document.paytm.submit(); </script>
                                   </form>
                                </body>
                             </html>`);
            res.end();
          });
        });

        post_req.write(post_data);
        post_req.end();
      });
    });
});

router.post("/callback", (req, res) => {
  let callbackResponse = "";

  req
    .on("error", (err) => {
      console.error(err.stack);
    })
    .on("data", (chunk) => {
      callbackResponse += chunk;
    })
    .on("end", () => {
      let data = qs.parse(callbackResponse);
      console.log(data);

      data = JSON.parse(JSON.stringify(data));

      const paytmChecksum = data.CHECKSUMHASH;

      var isVerifySignature = PaytmChecksum.verifySignature(
        data,
        PaytmConfig.PaytmConfig.key,
        paytmChecksum
      );
      if (isVerifySignature) {
        console.log("Checksum Matched");

        var paytmParams = {};

        paytmParams.body = {
          mid: PaytmConfig.PaytmConfig.mid,
          orderId: data.ORDERID,
        };

        PaytmChecksum.generateSignature(
          JSON.stringify(paytmParams.body),
          PaytmConfig.PaytmConfig.key
        ).then(function (checksum) {
          paytmParams.head = {
            signature: checksum,
          };

          var post_data = JSON.stringify(paytmParams);

          var options = {
            /* for Staging */
            hostname: "securegw-stage.paytm.in",

            /* for Production */
            // hostname: 'securegw.paytm.in',

            port: 443,
            path: "/v3/order/status",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": post_data.length,
            },
          };

          // Set up the request
          var response = "";
          var post_req = https.request(options, function (post_res) {
            post_res.on("data", function (chunk) {
              response += chunk;
            });

            post_res.on("end", function () {
              console.log("Response: ", response);
              res.write(response);
              res.end();
            });
          });

          // post the data
          post_req.write(post_data);
          post_req.end();
        });
      } else {
        console.log("Checksum Mismatched");
      }
    });
});

module.exports = router;
