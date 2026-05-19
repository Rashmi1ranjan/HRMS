exports.validateReportParams = (req, res, next) => {
    if (!req.params.userId || isNaN(req.params.userId)) {
        return res.status(400).json({ success: false, message: "Valid User ID must be provided" });
    }
    next();
};
