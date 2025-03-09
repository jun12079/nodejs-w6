const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('User')
const { isValidString, isValidPassword } = require('../utils/validUtils')
const appError = require('../utils/appError')
const { generateJWT } = require('../utils/jwtUtils')
const isAuth = require('../middlewares/isAuth')

const saltRounds = 10

router.post('/signup', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!isValidString(name) || !isValidString(email) || !isValidString(password)) {
            next(appError(400, "欄位未填寫正確"));
            return;
        }
        if (!isValidPassword(password)) {
            next(appError(400, "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"));
            return;
        }

        const userRepo = dataSource.getRepository('User')
        const findUser = await userRepo.findOne({
            where: {
                email
            }
        })
        if (findUser) {
            return next(appError(409, "Email已被使用"));
        }
        const hashPassword = bcrypt.hashSync(password, saltRounds)
        const newUser = userRepo.create({
            name,
            email,
            password: hashPassword,
            role: 'USER'
        })
        const result = await userRepo.save(newUser)

        res.status(201).json({
            status: "success",
            data: {
                user: {
                    id: result.id,
                    name: result.name
                }
            }
        })
    } catch (error) {
        logger.error(error)
        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!isValidString(email) || !isValidString(password)) {
            return next(appError(400, "欄位未填寫正確"));
        }
        if (!isValidPassword(password)) {
            return next(appError(400, "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"));
        }


        const userRepo = dataSource.getRepository('User')
        // 使用者不存在或密碼輸入錯誤
        const findUser = await userRepo.findOne({
            select: ['id', 'name', 'role', 'password'],
            where: {
                email
            }
        });
        if (!findUser) {
            return next(appError(400, "使用者不存在或密碼輸入錯誤"));
        }
        const isMatch = await bcrypt.compare(password, findUser.password)
        if (!isMatch) {
            return next(appError(400, "使用者不存在或密碼輸入錯誤"));
        }
        // TODO JWT
        const token = generateJWT({
            id: findUser.id,
            role: findUser.role
        })

        res.status(201).json({
            status: 'success',
            data: {
                token,
                user: {
                    name: findUser.name
                }
            }
        })
    } catch (error) {
        logger.error('登入錯誤:', error)
        next(error)
    }
})

router.get('/profile', isAuth, async (req, res, next) => {
    try {
        const { id } = req.user;
        if (!isValidString(id)) {
            return next(appError(400, '欄位未填寫正確'));
        }
        const findUser = await dataSource.getRepository('User').findOne({
            where: {
                id
            }
        })

        res.status(200).json({
            status: 'success',
            data: {
                email: findUser.email,
                name: findUser.name
            }
        })
    } catch (error) {
        logger.error('取得使用者資料錯誤:', error)
        next(error)
    }
})

router.put('/profile', isAuth, async (req, res, next) => {
    try {
        const { id } = req.user;
        const { name } = req.body;
        if (!isValidString(name) || !/^[\p{L}]{2,10}$/u.test(name)) {
            return next(appError('400', '欄位未填寫正確'));
        }

        const userRepo = dataSource.getRepository('User')
        // TODO 檢查使用者名稱未變更
        const findUser = await userRepo.findOne({
            where: {
                id
            }
        });
        if (findUser.name === name) {
            return next(appError(400, '使用者名稱未變更'));
        }

        const updateUser = await userRepo.update(
            {
                id
            }
            ,
            {
                name
            }
        );
        if (updateUser.affected === 0) {
            return next(appError(404, '使用者不存在'));
        }

        res.status(200).json({
            status: 'success',
        })

    } catch (error) {
        logger.error('取得使用者資料錯誤:', error)
        next(error)
    }
})

module.exports = router