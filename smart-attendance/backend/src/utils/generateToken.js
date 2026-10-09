import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  // Token sign karte hain user ID aur Secret key ke saath
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

  return token;
};

export default generateToken;