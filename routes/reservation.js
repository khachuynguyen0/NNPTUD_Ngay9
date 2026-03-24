var express = require("express");
var router = express.Router();
let reservationModel = require('../schemas/reservation')
let cartModel = require('../schemas/carts')
let inventoryModel = require('../schemas/inventories')
let productModel = require('../schemas/products')
let mongoose = require('mongoose')
let { CheckLogin } = require('../utils/authHandler')

// GET all reservations of current user
router.get('/', CheckLogin, async function (req, res, next) {
    let user = req.user;
    let reservations = await reservationModel.find({
        user: user._id
    }).sort({ createdAt: -1 })
    res.send(reservations)
})

// GET reservation by ID
router.get('/:id', CheckLogin, async function (req, res, next) {
    try {
        let user = req.user;
        let reservation = await reservationModel.findOne({
            _id: req.params.id,
            user: user._id
        })
        if (reservation) {
            res.send(reservation)
        } else {
            res.status(404).send({ message: "reservation not found" })
        }
    } catch (error) {
        res.status(404).send({ message: error.message })
    }
})

// POST create reservation from cart (Transaction)
router.post('/', CheckLogin, async function (req, res, next) {
    let session = await mongoose.startSession()
    session.startTransaction()
    try {
        let user = req.user;
        let cart = await cartModel.findOne({ user: user._id })

        if (!cart || cart.items.length === 0) {
            await session.abortTransaction()
            session.endSession()
            return res.status(400).send({ message: "gio hang trong" })
        }

        let reservationItems = []
        let amount = 0

        for (let item of cart.items) {
            let product = await productModel.findById(item.product)
            if (!product) {
                await session.abortTransaction()
                session.endSession()
                return res.status(404).send({ message: "san pham khong ton tai: " + item.product })
            }

            let inventory = await inventoryModel.findOne({ product: item.product })
            if (!inventory || inventory.stock < item.quantity) {
                await session.abortTransaction()
                session.endSession()
                return res.status(400).send({ message: "san pham khong du hang: " + product.title })
            }

            // Reduce stock and increase reserved
            inventory.stock -= item.quantity
            inventory.reserved += item.quantity
            await inventory.save({ session })

            let subtotal = product.price * item.quantity
            amount += subtotal

            reservationItems.push({
                product: item.product,
                title: product.title,
                quantity: item.quantity,
                price: product.price,
                subtotal: subtotal
            })
        }

        // Create reservation
        let newReservation = new reservationModel({
            user: user._id,
            items: reservationItems,
            status: "actived",
            expiredIn: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            amount: amount
        })
        await newReservation.save({ session })

        // Clear cart
        cart.items = []
        await cart.save({ session })

        await session.commitTransaction()
        session.endSession()
        res.send(newReservation)
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        res.status(500).send({ message: error.message })
    }
})

// PUT cancel reservation
router.put('/:id/cancel', CheckLogin, async function (req, res, next) {
    let session = await mongoose.startSession()
    session.startTransaction()
    try {
        let user = req.user;
        let reservation = await reservationModel.findOne({
            _id: req.params.id,
            user: user._id
        })

        if (!reservation) {
            await session.abortTransaction()
            session.endSession()
            return res.status(404).send({ message: "reservation not found" })
        }

        if (reservation.status !== "actived") {
            await session.abortTransaction()
            session.endSession()
            return res.status(400).send({ message: "chi co the huy reservation dang actived" })
        }

        // Restore inventory stock
        for (let item of reservation.items) {
            await inventoryModel.findOneAndUpdate(
                { product: item.product },
                {
                    $inc: {
                        stock: item.quantity,
                        reserved: -item.quantity
                    }
                },
                { session }
            )
        }

        reservation.status = "cancelled"
        await reservation.save({ session })

        await session.commitTransaction()
        session.endSession()
        res.send(reservation)
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        res.status(500).send({ message: error.message })
    }
})

module.exports = router;
