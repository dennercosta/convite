import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const root = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(root, 'public'), dataDir = path.join(root, 'dados');
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'casamento.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS respostas (
id INTEGER PRIMARY KEY, request_id TEXT UNIQUE NOT NULL, nome TEXT NOT NULL,
presenca TEXT NOT NULL CHECK(presenca IN ('sim','nao')), pessoas INTEGER NOT NULL,
mensagem TEXT NOT NULL, publicar INTEGER NOT NULL DEFAULT 0, aprovado INTEGER NOT NULL DEFAULT 0,
criado TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));`);
const sessions = new Map(), limits = new Map();
setInterval(() => { const now = Date.now(); for (const [key, value] of sessions) if (value < now) sessions.delete(key); for (const [key, value] of limits) if (value.until < now) limits.delete(key); }, 60000).unref();
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || '127.0.0.1';
const configuredOrigin = process.env.PUBLIC_ORIGIN ? new URL(process.env.PUBLIC_ORIGIN).origin : null;
function json(res, status, value) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); }
function allowed(req, res, type, max) {
  const key = `${type}:${req.socket.remoteAddress}`; let bucket = limits.get(key);
  if (!bucket || bucket.until < Date.now()) { bucket = { n: 0, until: Date.now() + 900000 }; limits.set(key, bucket); }
  if (++bucket.n > max) { res.setHeader('Retry-After', '900'); json(res, 429, { error: 'Muitas tentativas. Aguarde 15 minutos.' }); return false; } return true;
}
async function body(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new Error('Formato inválido.');
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > 16000) throw new Error('Conteúdo muito longo.'); chunks.push(chunk); }
  const parsed = JSON.parse(Buffer.concat(chunks).toString());
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Dados inválidos.'); return parsed;
}
const token = req => (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('sessao='))?.slice(7);
const authenticated = req => (sessions.get(token(req)) || 0) > Date.now();
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon' };
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: data:; media-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  try {
    const url = new URL(req.url, 'http://localhost');
    if (!['GET', 'HEAD', 'POST'].includes(req.method)) return json(res, 405, { error: 'Método não permitido.' });
    if (req.method === 'POST') {
      const expected = configuredOrigin || `http://${req.headers.host}`;
      if (req.headers.origin !== expected) return json(res, 403, { error: 'Origem não autorizada.' });
    }
    if (url.pathname === '/api/rsvp' && req.method === 'POST') {
      if (!allowed(req, res, 'rsvp', 30)) return;
      const p = await body(req);
      if (p.website) return json(res, 400, { error: 'Formulário inválido.' });
      if (typeof p.nome !== 'string' || p.nome.trim().length < 2 || p.nome.trim().length > 100 || !['sim', 'nao'].includes(p.presenca) || !Number.isInteger(p.pessoas) || (p.presenca === 'sim' && (p.pessoas < 1 || p.pessoas > 20)) || (p.presenca === 'nao' && p.pessoas !== 0) || typeof p.mensagem !== 'string' || p.mensagem.length > 1000 || typeof p.requestId !== 'string' || !/^[\da-f-]{36}$/i.test(p.requestId) || typeof p.publicar !== 'boolean') return json(res, 400, { error: 'Confira o nome, a presença, a quantidade e o recado.' });
      db.prepare('INSERT OR IGNORE INTO respostas(request_id,nome,presenca,pessoas,mensagem,publicar) VALUES(?,?,?,?,?,?)').run(p.requestId, p.nome.trim(), p.presenca, p.pessoas, p.mensagem.trim(), p.publicar ? 1 : 0);
      return json(res, 201, { ok: true });
    }
    if (url.pathname === '/api/recados' && req.method === 'GET') return json(res, 200, db.prepare('SELECT nome,mensagem FROM respostas WHERE aprovado=1 AND publicar=1 AND mensagem != ? ORDER BY id DESC LIMIT 100').all('').map(row => ({ nome: row.nome.split(/\s+/)[0], mensagem: row.mensagem })));
    if (url.pathname === '/api/login' && req.method === 'POST') {
      if (!allowed(req, res, 'login', 10)) return;
      const p = await body(req); const adminPath = path.join(dataDir, 'admin.json');
      if (!fs.existsSync(adminPath)) return json(res, 503, { error: 'Primeiro execute npm.cmd run configurar no terminal.' });
      const config = JSON.parse(fs.readFileSync(adminPath, 'utf8'));
      if (typeof p.senha !== 'string' || p.senha.length > 256 || !timingSafeEqual(scryptSync(p.senha, config.salt, 64), Buffer.from(config.hash, 'hex'))) return json(res, 401, { error: 'Senha incorreta.' });
      const id = randomBytes(32).toString('hex'); sessions.set(id, Date.now() + 4 * 3600000);
      res.setHeader('Set-Cookie', `sessao=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=14400${configuredOrigin?.startsWith('https:') ? '; Secure' : ''}`);
      return json(res, 200, { ok: true });
    }
    if (url.pathname.startsWith('/api/admin/')) {
      if (!authenticated(req)) return json(res, 401, { error: 'Entre no painel novamente.' });
      if (url.pathname === '/api/admin/respostas' && req.method === 'GET') return json(res, 200, db.prepare('SELECT id,nome,presenca,pessoas,mensagem,publicar,aprovado,criado FROM respostas ORDER BY id DESC').all());
      if (url.pathname === '/api/admin/alterar' && req.method === 'POST') {
        const p = await body(req); if (!Number.isInteger(p.id)) return json(res, 400, { error: 'Identificador inválido.' });
        if (p.acao === 'excluir') db.prepare('DELETE FROM respostas WHERE id=?').run(p.id);
        else if (['aprovar','ocultar'].includes(p.acao)) db.prepare('UPDATE respostas SET aprovado=? WHERE id=? AND publicar=1').run(p.acao === 'aprovar' ? 1 : 0, p.id);
        else return json(res, 400, { error: 'Ação inválida.' });
        return json(res, 200, { ok: true });
      }
      if (url.pathname === '/api/admin/sair' && req.method === 'POST') { sessions.delete(token(req)); res.setHeader('Set-Cookie', 'sessao=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'); return json(res, 200, { ok: true }); }
      if (url.pathname === '/api/admin/exportar' && req.method === 'GET') {
        const rows = db.prepare('SELECT nome,presenca,pessoas,mensagem,publicar,aprovado,criado FROM respostas ORDER BY id').all();
        const cell = value => { let v = String(value); if (/^[\s]*[=+@-]/.test(v)) v = "'" + v; return '"' + v.replaceAll('"', '""') + '"'; };
        const csv = ['Nome;Presença;Pessoas;Recado;Autoriza mural;Aprovado;Recebido em', ...rows.map(row => Object.values(row).map(cell).join(';'))].join('\r\n');
        res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="confirmacoes.csv"', 'Cache-Control': 'no-store' }); return res.end('\uFEFF' + csv);
      }
      return json(res, 404, { error: 'Rota não encontrada.' });
    }
    if (url.pathname.startsWith('/api/')) return json(res, 404, { error: 'Rota não encontrada.' });
    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Método não permitido.' });
    const relative = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname === '/admin' ? '/admin.html' : url.pathname);
    const filename = path.resolve(pub, '.' + relative);
    if (!filename.startsWith(pub + path.sep) || relative.includes('\\')) return json(res, 403, { error: 'Acesso negado.' });
    if (!fs.existsSync(filename) || !fs.statSync(filename).isFile()) return json(res, 404, { error: 'Arquivo não encontrado.' });
    res.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    if (req.method === 'HEAD') return res.end(); fs.createReadStream(filename).pipe(res);
  } catch (error) {
    if (error instanceof SyntaxError || /inválido|inválidos|longo/.test(error.message)) return json(res, 400, { error: 'Não foi possível ler os dados enviados.' });
    console.error('Erro interno:', error.message); if (!res.headersSent) json(res, 500, { error: 'Erro ao salvar. Tente novamente.' }); else res.end();
  }
});
server.listen(port, host, () => console.log(`Convite: http://${host}:${port}\nPainel: http://${host}:${port}/admin\nCtrl+C para encerrar.`));
function shutdown() { server.close(() => { db.close(); process.exit(0); }); }
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
