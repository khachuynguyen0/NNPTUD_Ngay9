let express = require('express')
let router = express.Router()
let inventoryModel = require('../schemas/inventories')
let { CheckLogin, checkRole } = require('../utils/authHandler')

// GET all inventories
router.get('/', async function (req, res, next) {
    let result = await inventoryModel.find().populate({
        path: 'product',
        select: 'title price images'
    })
    res.send(result)
})

// GET inventory by product ID
router.get('/:productId', async function (req, res, next) {
    try {
        let result = await inventoryModel.findOne({
            product: req.params.productId
        }).populate({
            path: 'product',
            select: 'title price images'
        })
        if (result) {
            res.send(result)
        } else {
            res.status(404).send({ message: "inventory not found" })
        }
    } catch (error) {
        res.status(404).send({ message: error.message })
    }
})

// PUT update stock for a product (admin only)
router.put('/:productId', CheckLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        let result = await inventoryModel.findOneAndUpdate(
            { product: req.params.productId },
            { stock: req.body.stock },
            { new: true }
        ).populate({
            path: 'product',
            select: 'title price images'
        })
        if (result) {
            res.send(result)
        } else {
            res.status(404).send({ message: "inventory not found" })
        }
    } catch (error) {
        res.status(404).send({ message: error.message })
    }
})

module.exports = router
