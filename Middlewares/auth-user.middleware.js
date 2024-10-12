import jwt from 'jsonwebtoken';
import RequestError from '../errors/RequestError.js';
import { UserModel } from '../Models/user.model.js';

// Define JWT authentication middleware
const authUser = async (req, res, next) => {
  // Extract token
  const token = req.headers['authorization'];
  try {
    // If token not found, throw custom error to send failure response
    if (!token) {
      return next(new RequestError('Token not found!', 401));
    }

    const secretKey = process.env.JWT_SECRET;
    // Verify token using JWT
    const payload = jwt.verify(token, secretKey);

    const tokens = (await UserModel.findById(payload.userId).select('tokens')).tokens;

    const expiredToken = tokens.find((t) => t.token == token && t.isExpired);

    if (expiredToken)
      return next(
        new RequestError('Token Expaired!', 401, { expiredAt: expiredToken.expiredAt.toString() })
      );

    // Attach user id to incoming request body for further usage
    req.userId = payload.userId;

    // Call the next middleware if token is valid
    next();
  } catch (err) {
    // Handle token expairation error
    if (err.name == 'TokenExpiredError') {
      return next(new RequestError('Token Expaired!', 401, { expiredAt: err.expiredAt.toString() }));
    }

    // Handle token invalid error
    if (err.name == 'JsonWebTokenError') {
      return next(new RequestError('Invalid Token!', 401, { token }));
    }

    // Send unauthorized error for other errors
    return next(new RequestError('Unauthorized!', 401));
  }
};

// Export JWT authentication middleware as default
export default authUser;
