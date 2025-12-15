import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import { Challenge, ChallengeAnswer, User, sequelize } from '../models/index.js';

function normalize(text = '') {
  return String(text || '').trim().toLowerCase();
}

export async function listActive() {
  const items = await Challenge.findAll({
    where: { status: 'active' },
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['correctAnswer', 'correctOptionIndex'] }
  });
  return items;
}

export async function getPublic(id) {
  const item = await Challenge.findByPk(id, {
    attributes: { exclude: ['correctAnswer', 'correctOptionIndex'] },
    include: [{ model: User, as: 'winner', attributes: ['id', 'username'] }]
  });
  return item;
}

export async function create({ type = 'text', title, question, correctAnswer, prizeDescription, status = 'active', options, correctOptionIndex, imageUrl }) {
  const payload = {
    type,
    title,
    question,
    prizeDescription,
    status,
    imageUrl: imageUrl || null
  };
  if (type === 'qcm') {
    const opts = Array.isArray(options) ? options.map((o) => String(o || '').trim()).filter(Boolean) : [];
    if (opts.length < 2) throw new Error('QCM requires at least 2 options');
    if (correctOptionIndex === undefined || correctOptionIndex === null) throw new Error('Missing correctOptionIndex');
    if (correctOptionIndex < 0 || correctOptionIndex >= opts.length) throw new Error('correctOptionIndex out of range');
    payload.options = opts;
    payload.correctOptionIndex = Number(correctOptionIndex);
    payload.correctAnswer = '__qcm__'; // placeholder not used for QCM
  } else {
    payload.options = null;
    payload.correctOptionIndex = null;
    payload.correctAnswer = normalize(correctAnswer);
  }
  const challenge = await Challenge.create(payload);
  return challenge;
}

export async function update({ id, changes }) {
  const challenge = await Challenge.findByPk(id);
  if (!challenge) return null;
  const payload = { ...changes };
  if (payload.type && !['text', 'qcm'].includes(payload.type)) delete payload.type;
  if (payload.correctAnswer !== undefined && (payload.type === 'text' || challenge.type === 'text')) {
    payload.correctAnswer = normalize(payload.correctAnswer);
  }
  if ((payload.type === 'qcm') || (challenge.type === 'qcm')) {
    if (payload.options !== undefined) {
      const opts = Array.isArray(payload.options) ? payload.options.map((o) => String(o || '').trim()).filter(Boolean) : [];
      if (opts.length < 2) throw new Error('QCM requires at least 2 options');
      payload.options = opts;
      if (payload.correctOptionIndex === undefined) {
        // keep existing index if valid
        payload.correctOptionIndex = challenge.correctOptionIndex;
      }
    }
    if (payload.correctOptionIndex !== undefined && payload.options) {
      if (payload.correctOptionIndex < 0 || payload.correctOptionIndex >= payload.options.length) {
        throw new Error('correctOptionIndex out of range');
      }
    }
    if (payload.type === 'qcm' || challenge.type === 'qcm') {
      payload.correctAnswer = '__qcm__';
    }
  }
  await challenge.update(payload);
  return challenge;
}

export async function close({ id }) {
  const challenge = await Challenge.findByPk(id);
  if (!challenge) return null;
  await challenge.update({ status: 'closed' });
  return challenge;
}

export async function listAdmin({ page = 1, limit = 20 }) {
  const offset = (Number(page) - 1) * Number(limit);
  const { rows, count } = await Challenge.findAndCountAll({
    order: [['createdAt', 'DESC']],
    limit: Number(limit),
    offset,
    include: [{ model: User, as: 'winner', attributes: ['id', 'username'] }]
  });
  return { items: rows, total: count, page: Number(page), limit: Number(limit) };
}

export async function listAnswers({ challengeId }) {
  const items = await ChallengeAnswer.findAll({
    where: { challengeId },
    order: [['createdAt', 'ASC']],
    include: [{ model: User, as: 'user', attributes: ['id', 'username'] }]
  });
  return items;
}

export function extractUserIdFromAuthHeader(header) {
  try {
    const token = (header || '').startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return null;
    const payload = jwt.verify(token, process.env.JWT_SECRET || '');
    return payload?.id || null;
  } catch {
    return null;
  }
}

export async function submitAnswer({ challengeId, answerText, selectedOptionIndex, userId, ipAddress }) {
  const challenge = await Challenge.findByPk(challengeId);
  if (!challenge) return { error: 'Challenge not found' };
  if (challenge.status !== 'active') return { error: 'Challenge is not active' };

  // Limit attempts: one per user or per IP
  if (userId) {
    const existing = await ChallengeAnswer.findOne({ where: { challengeId, userId } });
    if (existing) return { error: 'You already attempted this challenge' };
  } else if (ipAddress) {
    const existing = await ChallengeAnswer.findOne({ where: { challengeId, ipAddress } });
    if (existing) return { error: 'You already attempted this challenge' };
  }

  let isCorrect = false;
  let selectedIdx = null;
  if (challenge.type === 'qcm') {
    if (selectedOptionIndex === undefined || selectedOptionIndex === null) {
      return { error: 'Missing selectedOptionIndex' };
    }
    selectedIdx = Number(selectedOptionIndex);
    if (Number.isNaN(selectedIdx)) return { error: 'Invalid selectedOptionIndex' };
    const opts = Array.isArray(challenge.options) ? challenge.options : [];
    if (selectedIdx < 0 || selectedIdx >= opts.length) return { error: 'selectedOptionIndex out of range' };
    isCorrect = selectedIdx === Number(challenge.correctOptionIndex);
  } else {
    const normalized = normalize(answerText);
    isCorrect = !!normalized && normalized === challenge.correctAnswer;
  }

  let isWinner = false;
  // Create answer and attempt winner set atomically
  return await sequelize.transaction(async (t) => {
    const saved = await ChallengeAnswer.create({
      challengeId,
      userId: userId || null,
      ipAddress: ipAddress || null,
      answerText,
      selectedOptionIndex: selectedIdx,
      isCorrect
    }, { transaction: t });

    if (isCorrect) {
      const [updated] = await Challenge.update(
        { winnerUserId: userId || null, winnerAt: new Date() },
        { where: { id: challengeId, winnerUserId: { [Op.is]: null } }, transaction: t }
      );
      isWinner = updated === 1;
      if (!isWinner) {
        // Someone else has already won; ensure status can remain active (multiple active supported)
      }
    }

    return { isCorrect, isWinner, answerId: saved.id };
  });
}


