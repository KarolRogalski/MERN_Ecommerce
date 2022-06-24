import express from 'express'
import expressAsyncHandler from 'express-async-handler'
import Product from '../models/productModel.js'
import Order from '../models/orderModel.js'
import User from '../models/userModel.js'
import nodemailer from 'nodemailer'
import { isAuth, isAdmin, payOrderEmailTemplate } from '../utils.js'

const orderRouter = express.Router()

orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name')
    res.send(orders)
  })
)

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    })
    const order = await newOrder.save()
    res.status(201).send({ message: 'New Order Created', order })
  })
)

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ])
    const users = await User.aggregate([
      {
        $group: { _id: null, numUsers: { $sum: 1 } },
      },
    ])
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { id: 1 } },
    ])
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ])
    res.send({ users, orders, dailyOrders, productCategories })
  })
)

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
    if (orders) {
      res.send(orders)
    } else {
      res.status(404).send({ message: 'Orders Not Found' })
    }
  })
)

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (order) {
      res.send(order)
    } else {
      res.status(404).send({ message: 'Order Not Found' })
    }
  })
)

orderRouter.put(
  '/:id/deliver',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (order) {
      order.isDelivered = true
      order.deliveredAt = Date.now()
      await order.save()
      res.send({ message: 'Order Delivered' })
    } else {
      res.status(404).send({ message: 'Order Not Found' })
    }
  })
)

orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    )
    if (order) {
      order.isPaid = true
      order.paidAt = Date.now()
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      }
      const updateOrder = await order.save()

      let transporter = nodemailer.createTransport({
        host: 'smtp.ionos.co.uk',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_USER, // generated ethereal user
          pass: process.env.MAIL_PASSWORD, // generated ethereal password
        },
        tls: {
          rejectUnauthorized: false,
        },
      })
      // send mail with defined transport object
      try {
        let info = await transporter.sendMail({
          from: '"MERN ECOMMERCE 👻" <test@rogalskikarol.co.uk>', // sender address
          to: `${order.user.name} <${order.user.email}`, // list of receivers
          subject: `✔ New Order ${order._id}`, // Subject line
          text: 'Hello world?', // plain text body
          html: payOrderEmailTemplate(order), // html body
        })

        console.log('Message sent: %s', info.messageId)
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
      } catch (err) {
        console.log(err)
      }

      res.send({ message: 'Order Paid', order: updateOrder })
    } else {
      res.status(404).send({ message: 'Order not found' })
    }
  })
)

orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (order) {
      await order.remove()
      res.send({ message: 'Order Deleted' })
    } else {
      res.status(404).send({ message: 'Order Not Found' })
    }
  })
)

export default orderRouter
