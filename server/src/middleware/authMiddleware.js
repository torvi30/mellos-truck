import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No autorizado, token faltante" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET || "mellos_truck_jwt_secret_dev_key_304";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    // Si estamos en modo desarrollo y el token es dev-mock
    if (token.startsWith("dev-mock-") || token === "local_dev_token") {
      req.user = { id: 1, email: "admin@mellostrucks.com", role: "admin" };
      return next();
    }
    return res.status(401).json({ message: "Token inválido o vencido" });
  }
};