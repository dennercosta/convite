import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'dados', 'casamento.sqlite');
if (!fs.existsSync(source)) { console.error('Ainda não existe um banco. Inicie o servidor primeiro.'); process.exitCode = 1; }
else {
  const dir = path.join(root, 'backups'); fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, `casamento-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`);
  const db = new DatabaseSync(source); db.exec('PRAGMA busy_timeout=5000'); db.prepare('VACUUM INTO ?').run(target); db.close();
  console.log(`Backup consistente criado em:\n${target}\nCopie também este arquivo para outro dispositivo. Ele contém dados dos convidados.`);
}
