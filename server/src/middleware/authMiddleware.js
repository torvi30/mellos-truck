import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No autorizado, token faltante" });
  }

  const token = authHeader.split(" ")[1];

  // 1. Tokens de desarrollo local
  if (token.startsWith("dev-mock-") || token === "local_dev_token") {
    req.user = { id: 1, email: "admin@mellostrucks.com", role: "admin" };
    return next();
  }

  // 2. Intentar validar con JWT_SECRET local de Express
  try {
    const secret = process.env.JWT_SECRET || "mellos_truck_jwt_secret_dev_key_304";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (err) {
    // 3. Si falla, verificar si es un token de Firebase Auth emitido por Google
    try {
      const decodedGoogle = jwt.decode(token);
      if (
        decodedGoogle &&
        (decodedGoogle.iss?.startsWith("https://securetoken.google.com/") || decodedGoogle.firebase)
      ) {
        // Validar expiración del token de Firebase
        if (decodedGoogle.exp && decodedGoogle.exp * 1000 < Date.now()) {
          return res.status(401).json({ message: "Token de Firebase expirado" });
        }
        req.user = {
          id: decodedGoogle.user_id || decodedGoogle.sub || 1,
          email: decodedGoogle.email || "admin@mellostrucks.com",
          role: "admin",
          firebase: true,
        };
        return next();
      }
    } catch (_) {}

    return res.status(401).json({ message: "Token inválido o vencido" });
  }
};