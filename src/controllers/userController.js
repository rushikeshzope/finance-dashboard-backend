import * as userService from '../services/userService.js';
import { sendSuccess } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
  const data = await userService.getUsers();
  sendSuccess(res, data, 200);
});

export const updateRole = asyncHandler(async (req, res) => {
  const data = await userService.updateRole(req.params.id, req.body.role);
  sendSuccess(res, data, 200);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const data = await userService.updateStatus(req.params.id, req.body.status, req.user.id);
  sendSuccess(res, data, 200);
});
