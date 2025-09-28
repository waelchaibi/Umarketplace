import bcrypt from 'bcrypt';
import { User } from '../models/index.js';
import { signJwt } from '../utils/jwt.js';

export async function register({ username, email, password, firstName, lastName }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 400 });
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) throw Object.assign(new Error('Username already taken'), { status: 400 });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hash, firstName, lastName });
  const token = signJwt({ id: user.id, role: user.role });
  return { user: sanitize(user), token };
}

export async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  if (user.isSuspended) throw Object.assign(new Error('Account suspended'), { status: 403 });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  const token = signJwt({ id: user.id, role: user.role });
  return { user: sanitize(user), token };
}

export async function getProfile(userId) {
  const user = await User.findByPk(userId);
  return sanitize(user);
}

export async function updateProfile(userId, changes) {
  const user = await User.findByPk(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const updatable = ['username', 'firstName', 'lastName', 'profilePicture'];
  updatable.forEach((field) => {
    if (changes[field] !== undefined) user[field] = changes[field];
  });
  await user.save();
  return sanitize(user);
}

export async function verifyEmail(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  user.isVerified = true;
  await user.save();
  return sanitize(user);
}

function sanitize(user) {
  if (!user) return null;
  const { password, ...safe } = user.toJSON();
  return safe;
}

export default { register, login, getProfile, updateProfile, verifyEmail };
