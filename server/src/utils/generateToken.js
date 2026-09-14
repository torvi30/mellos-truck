import jwt from "jsonwebtoken";

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || "mellos_truck_jwt_secret_dev_key_304";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export default generateToken;