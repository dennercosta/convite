import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync } from 'node:crypto';
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dados');
fs.mkdirSync(dir, { recursive: true });
const filename = path.join(dir, 'admin.json');
if (fs.existsSync(filename) && !process.argv.includes('--nova-senha')) {
  console.log('O painel já foi configurado. Para gerar outra senha, pare o servidor e use: npm.cmd run configurar -- --nova-senha');
} else {
  const senha = randomBytes(18).toString('base64url'), salt = randomBytes(16).toString('hex');
  fs.writeFileSync(filename, JSON.stringify({ salt, hash: scryptSync(senha, salt, 64).toString('hex') }, null, 2), { mode: 0o600 });
  console.log(`Painel configurado. Guarde esta senha em um local seguro:\n\n${senha}\n\nEla não será exibida novamente. Inicie com npm.cmd start e abra http://localhost:8080/admin`);
}
