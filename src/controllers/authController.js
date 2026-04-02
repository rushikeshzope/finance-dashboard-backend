import { registerUser, loginUser } from '../services/authService.js';
import { sendSuccess } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const data = await registerUser(name, email, password);
  sendSuccess(res, data, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await loginUser(email, password);
  sendSuccess(res, data, 200);
});
