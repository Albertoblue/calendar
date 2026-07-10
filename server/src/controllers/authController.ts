import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User, IUser } from '../models/User';
import { signToken } from '../lib/jwt';
import { AuthRequest } from '../middleware/auth';

function publicUser(u: IUser) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    color: u.color,
    avatarUrl: u.avatarUrl,
    spaceId: u.spaceId ?? null,
  };
}

const registerSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  color: z.string().optional(),
});

export const register = async (req: AuthRequest, res: Response) => {
  const data = registerSchema.parse(req.body);
  const exists = await User.findOne({ email: data.email });
  if (exists) {
    return res.status(409).json({ error: 'Ese email ya esta registrado' });
  }
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash,
    color: data.color ?? '#0F6CBD',
  });
  const token = signToken({ userId: user._id.toString() });
  return res.status(201).json({ token, user: publicUser(user) });
};

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const login = async (req: AuthRequest, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }
  const token = signToken({ userId: user._id.toString() });
  return res.json({ token, user: publicUser(user) });
};

export const me = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  return res.json({ user: publicUser(user) });
};
