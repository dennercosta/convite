const $ = id => document.getElementById(id);
async function api(path, data) {
  const res = await fetch(path, data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {});
  const result = await res.json();
  if (res.status === 401) { $('painel').hidden = true; $('login').hidden = false; }
  if (!res.ok) throw new Error(result.error); return result;
}
async function load() {
  const rows = await api('/api/admin/respostas'); $('login').hidden = true; $('painel').hidden = false; $('linhas').replaceChildren();
  $('totais').textContent = `${rows.length} respostas • ${rows.filter(r => r.presenca === 'sim').reduce((n, r) => n + r.pessoas, 0)} pessoas confirmadas • ${rows.filter(r => r.presenca === 'nao').length} respostas de ausência`;
  for (const row of rows) {
    const tr = document.createElement('tr');
    for (const value of [row.nome, row.presenca === 'sim' ? 'Vai comparecer' : 'Não poderá ir', row.pessoas, row.mensagem, row.publicar ? (row.aprovado ? 'Publicado' : 'Aguardando aprovação') : 'Privado']) { const td = document.createElement('td'); td.textContent = value; tr.append(td); }
    const actions = document.createElement('td');
    for (const [action, label] of [...(row.publicar && row.mensagem ? [[row.aprovado ? 'ocultar' : 'aprovar', row.aprovado ? 'Ocultar recado' : 'Publicar recado']] : []), ['excluir', 'Excluir resposta']]) {
      const btn = document.createElement('button'); btn.textContent = label;
      btn.addEventListener('click', async () => { if (action === 'excluir' && !confirm(`Excluir permanentemente a resposta de ${row.nome}?`)) return; btn.disabled = true; try { await api('/api/admin/alterar', { id: row.id, acao: action }); await load(); $('status').textContent = 'Alteração salva.'; } catch (e) { $('status').textContent = e.message; } finally { btn.disabled = false; } }); actions.append(btn);
    }
    tr.append(actions); $('linhas').append(tr);
  }
}
$('login').addEventListener('submit', async e => { e.preventDefault(); const button = e.target.querySelector('button'); button.disabled = true; try { await api('/api/login', { senha: e.target.elements.senha.value }); e.target.reset(); await load(); $('status').textContent = ''; } catch (err) { $('status').textContent = err.message; } finally { button.disabled = false; } });
$('atualizar').addEventListener('click', () => load().catch(e => $('status').textContent = e.message));
$('sair').addEventListener('click', async () => { try { await api('/api/admin/sair', {}); $('painel').hidden = true; $('login').hidden = false; $('linhas').replaceChildren(); $('status').textContent = 'Você saiu do painel.'; } catch (e) { $('status').textContent = e.message; } });
load().catch(() => {});
