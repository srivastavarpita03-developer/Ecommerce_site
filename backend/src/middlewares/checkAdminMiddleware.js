async function checkAdminMiddleware(req, res, next) {
  const userData = req.user;
  if (!userData) {
    return res.status(404).send({ success: false, message: "User Not Found!" });
  }
  const isAdmin = userData?.role == "admin";
  if (!isAdmin) {
    return res
      .status(401)
      .send({ success: false, message: "Unauthorized Access" });
  }
  next();
}

module.exports = checkAdminMiddleware;
