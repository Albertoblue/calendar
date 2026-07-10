// Genera un codigo de invitacion legible (sin caracteres ambiguos como 0/O, 1/I).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function makeInviteCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}
