import { extractUserIdFromAuthHeader, listActive, getPublic, create, update, close, submitAnswer, listAdmin, listAnswers } from '../services/defi.service.js';

export async function getActive(req, res, next) {
  try {
    const data = await listActive();
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function getChallenge(req, res, next) {
  try {
    const data = await getPublic(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function postAnswer(req, res, next) {
  try {
    const userId = extractUserIdFromAuthHeader(req.headers.authorization);
    const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || null;
    const { isCorrect, isWinner, answerId, error } = await submitAnswer({
      challengeId: req.params.id,
      answerText: req.body?.answerText || '',
      userId,
      ipAddress: ip || null
    });
    if (error) return res.status(400).json({ success: false, error });
    res.json({ success: true, data: { isCorrect, isWinner, answerId } });
  } catch (e) { next(e); }
}

// Admin
export async function adminCreate(req, res, next) {
  try {
    const data = await create({
      title: req.body.title,
      question: req.body.question,
      correctAnswer: req.body.correctAnswer,
      prizeDescription: req.body.prizeDescription,
      status: req.body.status || 'active'
    });
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function adminUpdate(req, res, next) {
  try {
    const changes = { ...req.body };
    const data = await update({ id: req.params.id, changes });
    if (!data) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function adminClose(req, res, next) {
  try {
    const data = await close({ id: req.params.id });
    if (!data) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function adminList(req, res, next) {
  try {
    const data = await listAdmin({ page: Number(req.query.page || 1), limit: Number(req.query.limit || 20) });
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function adminAnswers(req, res, next) {
  try {
    const data = await listAnswers({ challengeId: req.params.id });
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export default {
  getActive,
  getChallenge,
  postAnswer,
  adminCreate,
  adminUpdate,
  adminClose,
  adminList,
  adminAnswers
};


