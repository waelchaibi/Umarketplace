import * as AuthService from '../services/auth.service.js';
import { validationResult } from 'express-validator';

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const result = await AuthService.register(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const result = await AuthService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function profile(req, res, next) {
  try {
    const data = await AuthService.getProfile(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function updateProfile(req, res, next) {
  try {
    const data = await AuthService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function verifyEmail(req, res, next) {
  try {
    const data = await AuthService.verifyEmail(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export default { register, login, profile, updateProfile, verifyEmail };
