// 參數 func 傳入 async 函式
const handleErrorAsync = (loggerMsg ,func) => {
    // 回傳 middleware 格式的新函式 
    return (req, res, next) => {
        // 執行傳入的 async 函式，使用 catch 統一捕捉
        func(req, res, next).catch((error) => { logger.error(`${取得使用者資料錯誤}:`, error); next(error); });
    };
};

module.exports = handleErrorAsync;
