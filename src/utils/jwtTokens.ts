import jwt from "jsonwebtoken";

const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "";
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "";
const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";

export const generateToken = (
  payload: { id: string },
  type: "accessToken" | "refreshToken"
): string => {
  const secret =
    type === "refreshToken" ? refreshTokenSecret : accessTokenSecret;
  const expiresIn =
    type === "refreshToken" ? refreshTokenExpiresIn : accessTokenExpiresIn;

  const token = jwt.sign(payload, secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });

  return token;
};

export const verifyToken = (
  token: string,
  type: "accessToken" | "refreshToken"
): jwt.JwtPayload | string => {
  const secret =
    type === "refreshToken" ? refreshTokenSecret : accessTokenSecret;
  return jwt.verify(token, secret);
};
