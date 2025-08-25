const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_EXPIRES = '15m';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refreshchangeme';
const REFRESH_EXPIRES = '7d';

exports.register = async (req, res) => {
  const { email, password, nome } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios.' });
  const exists = await userService.getUserByEmail(email);
  if (exists) return res.status(409).json({ error: 'Usuário já existe.' });
  const user = await userService.createUser({ email, password, nome });
  res.status(201).json({ id: user.id, email: user.email, nome: user.nome });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios.' });
  const user = await userService.getUserByEmail(email);
  if (!user || user.password !== password) return res.status(401).json({ error: 'Credenciais inválidas.' });
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  const refreshToken = jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
  res.json({ token, refreshToken });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken obrigatório.' });
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await userService.getUserById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: 'refreshToken inválido.' });
  }
};
