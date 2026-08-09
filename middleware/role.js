const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles)
      return res
        .status(404)
        .send({ status: "error", message: "Nothing Passed In" });
    // ! if (req.user.role !== roles[0] || req.user.role !== roles) ==> This is wrong becase if one side of it returns true ie if admin = false and maintainer = true,the if line will return true and if true is returned then access will be denied
    console.log(allowedRoles);
    console.log(allowedRoles.includes(req.user.role));
    console.log(!allowedRoles.includes(req.user.role));
    console.log(JSON.stringify(req.user.role));

    if (!allowedRoles.includes(req.user.role))
      return res
        .status(404)
        .send({ status: "error", message: "Access Not Authorized" });

    next();
  };
};

export default roleMiddleware;
