const express = require('express');
const router = express.Router();
const { dataSource } = require('../db/data-source');
const isAuth = require('../middlewares/isAuth');
const { IsNull } = require('typeorm');
const appError = require('../utils/appError');
const logger = require('../utils/logger')('User');

router.get('/', async (req, res, next) => {
    try {
        const courseRepo = dataSource.getRepository('Course');
        const data = await dataSource
            .getRepository('Course')
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.User', 'user')
            .leftJoinAndSelect('course.Skill', 'skill')
            .select([
                'course.id AS id',
                'user.name AS coach_name',
                'skill.name AS skill_name',
                'course.name AS name',
                'course.description AS description',
                'course.start_at AS start_at',
                'course.end_at AS end_at',
                'course.max_participants AS max_participants'
            ])
            .getRawMany();
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
});

router.post('/:courseId', isAuth, async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { id } = req.user;
        if (!courseId || !/^[0-9a-fA-F-]{36}$/.test(courseId)) {
            return next(appError(400, '欄位未填寫正確'));
        }
        const courseRepo = dataSource.getRepository('Course');
        const course = await courseRepo.findOne({
            where: {
                id: courseId
            }
        });
        if (!course) {
            return next(appError(400, 'ID錯誤'));
        }
        const courseBookingRepo = dataSource.getRepository('CourseBooking');
        const courseBooking = await courseBookingRepo.findOne({
            where: {
                user_id: id,
                course_id: courseId,
                cancelled_at: IsNull()
            }
        });
        if (courseBooking) {
            return next(appError(400, '已經報名過此課程'));
        }
        const creditPurchaseRepo = dataSource.getRepository('CreditPurchase');
        const creditPurchase = await creditPurchaseRepo.sum('purchased_credits', {
            user_id: id
        });
        const courseBookingCount = await courseBookingRepo.count({
            where: {
                user_id: id,
                cancelled_at: IsNull(),
            }
        });
        if (courseBookingCount >= creditPurchase) {
            return next(appError(400, '已無可使用堂數'));
        }
        if (courseBookingCount >= course.max_participants) {
            return next(appError(400, '已達最大參加人數，無法參加'));
        }

        const newCourseBooking = courseBookingRepo.create({
            user_id: id,
            course_id: courseId
        });
        await courseBookingRepo.save(newCourseBooking);

        res.status(201).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
});

router.delete('/:courseId', isAuth, async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { id } = req.user;
        if (!courseId || !/^[0-9a-fA-F-]{36}$/.test(courseId)) {
            return next(appError(400, '欄位未填寫正確'));
        }
        const courseBookingRepo = dataSource.getRepository('CourseBooking');
        const courseBooking = await courseBookingRepo.findOne({
            where: {
                user_id: id,
                course_id: courseId,
                cancelled_at: IsNull()
            }
        });
        if (!courseBooking) {
            return next(appError(400, '課程不存在'));
        }
        const updateCourseBooking = await courseBookingRepo.update({
            user_id: id,
            course_id: courseId,
            cancelled_at: IsNull()
        }, {
            cancelled_at: new Date().toISOString()
        });
        if (updateCourseBooking.affected === 0) {
            return next(appError(400, '取消失敗'));
        }
        res.status(200).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
});

module.exports = router