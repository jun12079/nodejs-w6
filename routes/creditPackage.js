const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')
const { isValidString, isNumber } = require('../utils/validUtils')

router.get('/', async (req, res, next) => {
    try {
        const creditPackages = await dataSource.getRepository("CreditPackage").find({
            select: ["id", "name", "credit_amount", "price"]
        })
        res.status(200).json({
            status: "success",
            data: creditPackages,
        })
    } catch (error) {
        next(error)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { name, credit_amount, price } = req.body;
        if (!isValidString(name) || !isNumber(credit_amount) || !isNumber(price)) {
            res.status(400).json({
                status: "failed",
                message: "欄位未填寫正確",
            })
            return;
        }

        const creditPackage = dataSource.getRepository("CreditPackage")
        const findCreditPackage = await creditPackage.find({
            where: {
                name
            }
        })
        if (findCreditPackage.length > 0) {
            res.status(409).json({
                status: "failed",
                message: "資料重複",
            })
            return;
        }

        const newCreditPackage = creditPackage.create({
            name,
            credit_amount,
            price
        })
        const result = await creditPackage.save(newCreditPackage)
        res.status(200).json({
            status: "success",
            data: result,
        })
    } catch (error) {
        sendErrorResponse(res)
    }
})

router.delete('/:creditPackageId', async (req, res, next) => {
    try {
        const { creditPackageId } = req.params;
        if (!isValidString(creditPackageId)) {
            res.status(400).json({
                status: "failed",
                message: "ID錯誤",
            })
            return;
        }
        const result = await dataSource.getRepository("CreditPackage").delete(creditPackageId)
        if (result.affected === 0) {
            res.status(400).json({
                status: "failed",
                message: "ID錯誤",
            })
            return;
        }
        res.status(200).json({
            status: "success",
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router
