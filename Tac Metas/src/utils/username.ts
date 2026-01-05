export function cleanUsername(raw: string): string {
  if (!raw) throw new Error("Usuário vazio");

  let u = raw;

  // remove BOM/zero-width e similares
  u = u.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // trim geral
  u = u.trim();

  // remover aspas simples e duplas
  u = u.replace(/^["']+|["']+$/g, "");

  // lowercase
  u = u.toLowerCase();

  // remover espaços internos
  u = u.replace(/\s+/g, "");

  // bloquear @
  if (u.includes("@")) throw new Error("Use apenas usuário, sem @");

  // validar caracteres
  if (!/^[a-z0-9._-]+$/.test(u)) throw new Error("Usuário inválido");

  return u;
}

export function usernameToEmail(username: string): string {
  const u = cleanUsername(username);
  // usar domínio REAL e simples para passar em qualquer validador:
  return `${u}@example.com`;
}
