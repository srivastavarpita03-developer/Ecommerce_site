function asyncHandler(fn) {
  return function (req, res, next) {
    try {
      Promise.resolve(fn(req, res, next)).catch((err) => {
        console.log(err);
        if (!res.headersSent) {
          res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: err.message,
          });
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  };
}

module.exports = asyncHandler;
