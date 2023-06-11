const express = require("express");
const dbconnected = require("../database/dbConnectivity");

const Router = express.Router();

let pageCounter = 1; // Initialize a page counter variable

Router.get("/", (req, res) => {
  const pageSize = 24; // Set the number of products per page

  const data = {
    api: "mtop.aliexpress.usertouch.products.query",
    result: {
      bottom: false,
      code: 0,
      finished: "false",
      page: pageCounter,
      pageSize: pageSize,
      productList: [],
    },
    ret: ["SUCCESS::调用成功"],
    v: "1.0"
  };

  const offset = (pageCounter - 1) * pageSize; // Calculate the offset based on the page counter and page size

  dbconnected.query(
    `SELECT * FROM productList LIMIT ${offset}, ${pageSize}`,
    (err, productList, fields) => {
      if (!err) {
        data.result.productList = productList.map((prodlist) => ({
          discount: prodlist.discount,
          freeShipping: prodlist.freeShipping === "true",
          minPrice: prodlist.minPrice,
          onClick: prodlist.onClick,
          orders: prodlist.orders,
          oriMinPrice: prodlist.oriMinPrice,
          productAverageStar: prodlist.productAverageStar,
          productDetailUrl: prodlist.productDetailUrl,
          productId: prodlist.productId,
          productImage: prodlist.productImage,
          productTitle: prodlist.productTitle,
          trace: prodlist.trace,
          widgetId: prodlist.widgetId,
          widgetOrigin: prodlist.widgetOrigin,
        }));

        const jsonResponse = `mtopjsonp5(${JSON.stringify(data)})`;
        res.set("Content-Type", "application/javascript");
        res.send(jsonResponse); // Send the response to the client
        pageCounter++; // Increment the page counter after each successful API query
      } else {
        console.log(err);
        res.status(500).send("Internal Server Error"); // Send an error response to the client
      }
    }
  );
});

module.exports = Router;
