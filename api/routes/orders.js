const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Order = require('../models/order'); // Import the Order model
const Product = require('../models/product'); // Import the Product model

//Handle incoming GET requests to /orders
router.get("/", (req, res, next) => {
    Order.find()
    .select("product quantity _id")
    .populate('product', 'name')
      .exec()
      .then(docs => {
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
              return {
                _id: doc._id,
                product: doc.product,
                quantity: doc.quantity,
                request: {
                  type: "GET",
                  url: "http://localhost:3000/orders/" + doc._id
                }
            };
        })
    });    
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  });

  router.post("/", (req, res, next) => {
    const productId = req.body.productId;
    const quantity = req.body.quantity;

    Product.findById(productId)
      .then(product => {
        if (!product) {
          return res.status(404).json({
            message: "Product not found"
          });
        }
        
        const order = new Order({
          _id: new mongoose.Types.ObjectId(), // Use new keyword for ObjectId
          quantity: quantity,
          product: productId
        });

        return order.save();
      })
      .then(result => {
        console.log(result);
        res.status(201).json({
          message: "Order stored",
          createdOrder: {
            _id: result._id,
            product: result.product,
            quantity: result.quantity
          },
          request: {
            type: "GET",
            url: "http://localhost:3000/orders/" + result._id
          }
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err.message // Send error message in response
        });
      });
  });


  router.get("/:orderId", (req, res, next) => {
    Order.findById(req.params.orderId)
    .populate('product')
      .exec()
      .then(order => {
        if (!order) {
          return res.status(404).json({
            message: "Order not found"
          });
        }
        res.status(200).json({
          order: order,
          request: {
            type: "GET",
            url: "http://localhost:3000/orders"
          }
        });
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  });
  
  router.delete("/:orderId", (req, res, next) => {
    const orderId = req.params.orderId;
    Order.deleteOne({ _id: orderId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Order deleted",
                request: {
                    type: "POST",
                    url: "http://localhost:3000/orders",
                    body: { productId: "ID", quantity: "Number" }
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;
