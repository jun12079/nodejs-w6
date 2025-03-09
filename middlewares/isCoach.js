const appError = require('../utils/appError')

module.exports = (req, res, next) => {
    if(!req.user || req.user.role !== 'COACH') {
        // 401, '使用者尚未成為教練'
        return next(appError(401, '使用者尚未成為教練'))
    }
    next();
}