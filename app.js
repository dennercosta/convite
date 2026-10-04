const c = window.CASAMENTO;
const $ = id => document.getElementById(id);
const text = (id, value) => { const el = $(id); if (el) el.textContent = value; };
function external(id, url) {
  try { const parsed = new URL(url); if (parsed.protocol !== 'https:') return; $(id).href = parsed.href; $(id).hidden = false; } catch {}
}
document.querySelectorAll('[data-noivos]').forEach(el => el.textContent = c.noivos);
document.querySelectorAll('[data-iniciais]').forEach(el => el.textContent = c.iniciais);
document.querySelectorAll('[data-data]').forEach(el => el.textContent = c.dataTexto);
document.title = `${c.noivos} | Nosso casamento`;
text('convite', c.convite); text('mensagem-fe', c.mensagemFe); text('referencia', c.referenciaBiblica);
const guest = new URLSearchParams(location.search).get('para') || new URLSearchParams(location.search).get('to');
if (guest && $('convidado')) text('convidado', guest.slice(0, 120));
let audio;
if (c.musica) { audio = new Audio(c.musica); audio.loop = true; }
$('abrir').addEventListener('click', () => {
  const abertura = $('abertura');
  const laco = $('laco');
  if (abertura.classList.contains('desatando') || abertura.classList.contains('abrindo')) return;

  if (audio) audio.play().then(() => $('musica').setAttribute('aria-label', 'Pausar música')).catch(() => {});

  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const abrirFolhas = () => {
    if (abertura.classList.contains('abrindo')) return;
    abertura.classList.remove('desatando');
    abertura.classList.add('abrindo');
    window.setTimeout(() => {
      abertura.hidden = true;
      document.body.classList.remove('convite-fechado');
      $('conteudo').inert = false;
      $('conteudo').classList.add('conteudo-aberto');
      $('inicio').tabIndex = -1;
      $('inicio').focus({ preventScroll: true });
      if (audio) $('musica').hidden = false;
    }, reduzirMovimento ? 80 : 1650);
  };

  if (reduzirMovimento || !laco || !laco.canPlayType('video/webm; codecs="vp9"')) {
    abrirFolhas();
    return;
  }

  abertura.classList.add('desatando');
  let limite;
  const terminarLaco = () => {
    window.clearTimeout(limite);
    abrirFolhas();
  };
  const ajustarLimite = () => {
    window.clearTimeout(limite);
    const espera = Number.isFinite(laco.duration) && laco.duration > 0
      ? (laco.duration * 1000) + 2000
      : 15000;
    limite = window.setTimeout(terminarLaco, espera);
  };

  laco.addEventListener('ended', terminarLaco, { once: true });
  laco.addEventListener('error', terminarLaco, { once: true });
  ajustarLimite();
  if (laco.readyState < 1) laco.addEventListener('loadedmetadata', ajustarLimite, { once: true });

  try {
    laco.currentTime = 0;
    const inicio = laco.play();
    if (inicio) inicio.catch(terminarLaco);
  } catch {
    terminarLaco();
  }
});
$('musica').addEventListener('click', async () => {
  if (!audio) return;
  if (audio.paused) { try { await audio.play(); $('musica').setAttribute('aria-label', 'Pausar música'); } catch { $('musica').title = 'Não foi possível carregar a música.'; } }
  else { audio.pause(); $('musica').setAttribute('aria-label', 'Tocar música'); }
});
if (c.historia) { $('historia').hidden = false; text('texto-historia', c.historia); }
if (c.fotoCapa) { document.querySelector('.lateral').classList.add('fotografica'); document.querySelector('.lateral').style.backgroundImage = `linear-gradient(#203b5b77,#203b5baa),url(${JSON.stringify(c.fotoCapa)})`; }
const evento = c.celebracao;
text('celebracao-horario', evento.horario || 'Horário a informar');
text('celebracao-local', evento.local || 'Local a informar');
text('celebracao-endereco', evento.endereco || 'Endereço a informar');
external('celebracao-mapa', evento.mapa);
text('traje', `Traje: ${c.traje || '[esporte fino / social]'}`);
text('prazo', `Para que possamos preparar tudo com muito carinho, pedimos que confirme sua presença até ${c.prazoConfirmacao || '[data]'}.`);
const eventDate = new Date(c.dataISO);
if (c.dataISO && Number.isFinite(eventDate.getTime())) {
  const tick = () => {
    const total = Math.max(0, Math.floor((eventDate.getTime() - Date.now()) / 1000));
    $('contador').replaceChildren(); $('contador').hidden = false;
    for (const [value, label] of [[Math.floor(total / 86400), 'dias'], [Math.floor(total / 3600) % 24, 'horas'], [Math.floor(total / 60) % 60, 'minutos'], [total % 60, 'segundos']]) {
      const el = document.createElement('span'), b = document.createElement('b'); b.textContent = String(value).padStart(2, '0'); el.append(b, label); $('contador').append(el);
    }
    if (total === 0) { $('contador').hidden = true; text('contador-legenda', 'Chegou o momento de celebrar o nosso amor!'); }
  }; tick(); setInterval(tick, 1000);
  const fmt = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const calendar = new URL('https://calendar.google.com/calendar/render');
  calendar.search = new URLSearchParams({ action: 'TEMPLATE', text: `Casamento — ${c.noivos}`, dates: `${fmt(eventDate)}/${fmt(new Date(eventDate.getTime() + 3600000))}`, location: `${evento.local} ${evento.endereco}`, details: 'Confira a programação no convite. Duração de 1 hora na agenda é apenas uma reserva inicial.' });
  external('calendario', calendar.href); $('calendario').target = '_blank'; $('calendario').rel = 'noopener';
}
// Sem horário confirmado, contamos dias do calendário no fuso do casamento.
// Assim não atribuímos um horário fictício à cerimônia.
if (!c.dataISO || !Number.isFinite(eventDate.getTime())) {
  const tickDays = () => {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: c.fuso, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const get = type => parts.find(part => part.type === type).value;
    const today = Date.UTC(Number(get('year')), Number(get('month')) - 1, Number(get('day')));
    const [year, month, day] = c.dataCasamento.split('-').map(Number);
    const days = Math.round((Date.UTC(year, month - 1, day) - today) / 86400000);
    $('contador').replaceChildren(); $('contador').hidden = days <= 0;
    if (days > 0) {
      const item = document.createElement('span'), number = document.createElement('b');
      number.textContent = String(days); item.append(number, days === 1 ? 'dia' : 'dias'); $('contador').append(item);
      text('contador-legenda', 'Para o nosso grande dia!');
    } else text('contador-legenda', days === 0 ? 'É hoje! Vamos celebrar o nosso amor!' : 'Um dia para guardar para sempre no coração.');
  };
  tickDays(); setInterval(tickDays, 60000);
}
for (const photo of c.fotos) {
  const fig = document.createElement('figure'), img = document.createElement('img'), cap = document.createElement('figcaption');
  img.src = photo.src; img.alt = photo.legenda || 'Foto dos noivos'; img.loading = 'lazy'; cap.textContent = photo.legenda || ''; fig.append(img, cap); $('fotos').append(fig); $('galeria').hidden = false;
}
if (c.pix.chave && c.pix.titular) {
  $('pix').hidden = false; $('pix-pendente').hidden = true;
  text('pix-chave', c.pix.chave); text('pix-titular', c.pix.titular); text('pix-banco', c.pix.banco);
}
$('abrir-pix').addEventListener('click', () => {
  const open = $('pix-painel').hidden; $('pix-painel').hidden = !open;
  $('abrir-pix').setAttribute('aria-expanded', String(open));
});
$('copiar-pix').addEventListener('click', async () => { try { await navigator.clipboard.writeText(c.pix.chave); text('pix-status', 'Chave copiada!'); } catch { text('pix-status', 'Selecione e copie a chave acima.'); } });
if (/^55\d{10,11}$/.test(c.whatsapp)) external('whatsapp', `https://wa.me/${c.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de falar sobre o casamento.')}`);
// A mensagem é revelada como uma escrita delicada quando entra na tela.
const mensagemDigitada = document.getElementById('texto-digitado');
const secaoMensagem = document.getElementById('mensagem-especial');
if (mensagemDigitada) {
  secaoMensagem?.classList.add('revelacao-pendente');
  const mensagemCompleta = (mensagemDigitada.dataset.texto || '').replace(/\\n/g, '\n');
  const revelarMensagem = () => {
    if (mensagemDigitada.dataset.iniciada) return;
    mensagemDigitada.dataset.iniciada = 'true';
    secaoMensagem?.classList.add('em-exibicao');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      mensagemDigitada.textContent = mensagemCompleta;
      return;
    }
    mensagemDigitada.classList.add('digitando');
    let indiceMensagem = 0;
    const digitar = () => {
      indiceMensagem += 1;
      mensagemDigitada.textContent = mensagemCompleta.slice(0, indiceMensagem);
      if (indiceMensagem >= mensagemCompleta.length) {
        mensagemDigitada.classList.remove('digitando');
        return;
      }
      const caractere = mensagemCompleta[indiceMensagem - 1];
      const pausa = caractere === '\n' ? 240 : /[.!?]/.test(caractere) ? 180 : /[,;]/.test(caractere) ? 85 : 24;
      window.setTimeout(digitar, pausa);
    };
    window.setTimeout(digitar, 620);
  };
  if ('IntersectionObserver' in window) {
    const observadorMensagem = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        revelarMensagem();
        observadorMensagem.disconnect();
      }
    }, { threshold: .28 });
    observadorMensagem.observe(mensagemDigitada);
  } else {
    revelarMensagem();
  }
}

// O calendário aparece somente quando o convidado chega até ele.
const secaoCalendario = document.getElementById('calendario-casamento');
if (secaoCalendario) {
  secaoCalendario.classList.add('revelacao-pendente');
  const revelarCalendario = () => secaoCalendario.classList.add('em-exibicao');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    revelarCalendario();
  } else {
    const observadorCalendario = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        revelarCalendario();
        observadorCalendario.disconnect();
      }
    }, { threshold: .2 });
    observadorCalendario.observe(secaoCalendario);
  }
}

// Revelação do horário e do local da cerimônia.
const secaoLocalCerimonia = document.querySelector('.cerimonia-apresentacao');
if (secaoLocalCerimonia) {
  secaoLocalCerimonia.classList.add('revelacao-pendente');
  const revelarLocalCerimonia = () => secaoLocalCerimonia.classList.add('em-exibicao');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    revelarLocalCerimonia();
  } else {
    const observadorLocalCerimonia = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        revelarLocalCerimonia();
        observadorLocalCerimonia.disconnect();
      }
    }, { threshold: .14 });
    observadorLocalCerimonia.observe(secaoLocalCerimonia);
  }
}

// Revelação do bloco de confirmação e presentes.
const secaoAcoesConvidados = document.querySelector('.acoes-convidados');
if (secaoAcoesConvidados) {
  secaoAcoesConvidados.classList.add('revelacao-pendente');
  const revelarAcoesConvidados = () => secaoAcoesConvidados.classList.add('em-exibicao');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    revelarAcoesConvidados();
  } else {
    const observadorAcoesConvidados = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        revelarAcoesConvidados();
        observadorAcoesConvidados.disconnect();
      }
    }, { threshold: .14 });
    observadorAcoesConvidados.observe(secaoAcoesConvidados);
  }
}

// Movimento sutil do fundo, sincronizado com a rolagem.
const fundoPagina = document.querySelector('main');
const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
if (fundoPagina && !movimentoReduzido.matches) {
  let fundoPendente = false;
  const atualizarFundo = () => {
    const deslocamento = Math.min(window.scrollY * 0.06, 220);
    fundoPagina.style.setProperty('--fundo-scroll', `${deslocamento.toFixed(1)}px`);
    fundoPendente = false;
  };
  window.addEventListener('scroll', () => {
    if (!fundoPendente) {
      fundoPendente = true;
      window.requestAnimationFrame(atualizarFundo);
    }
  }, { passive: true });
  atualizarFundo();
}

// Lista de presentes com disponibilidade em tempo real no Supabase.
const presentesModal = $('presentes-modal');
const presenteReservaModal = $('presente-reserva-modal');
const presentesGrid = $('presentes-grid');
const presenteReservaForm = $('presente-reserva-form');
const presentesConfigurados = Array.isArray(c.presentes)
  ? c.presentes.filter(item => item && /^[a-z0-9-]+$/i.test(item.id || '') && item.nome && item.imagem)
  : [];
const presenteOutro = { id: 'outro', nome: 'Outro presente', outro: true };
const supabasePresentes = c.supabase || {};
const supabasePresentesUrl = String(supabasePresentes.url || '').replace(/\/$/, '');
const supabasePresentesChave = String(supabasePresentes.anonKey || '');
const tabelaPresentes = /^[a-z0-9_]+$/i.test(supabasePresentes.tabelaPresentes || '')
  ? supabasePresentes.tabelaPresentes
  : 'presentes_reservados';
let presentesReservados = new Set();
let listaPresentesAtiva = false;
let presenteAtual = null;
let retornoPresenteTimer;

const bloquearPaginaPresentes = () => document.body.classList.add('modal-aberto');
const liberarPaginaPresentes = () => document.body.classList.remove('modal-aberto');

const criarCartaoPresente = item => {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = item.outro ? 'presente-card presente-card-outro' : 'presente-card';
  botao.disabled = !listaPresentesAtiva;
  botao.setAttribute('aria-label', item.outro ? 'Escolher outro presente' : `Escolher ${item.nome}`);

  const moldura = document.createElement('span');
  moldura.className = 'presente-card-moldura';
  if (item.outro) {
    const simbolo = document.createElement('span');
    simbolo.className = 'presente-outro-simbolo';
    simbolo.textContent = '✦';
    moldura.append(simbolo);
  } else {
    const imagem = document.createElement('img');
    imagem.src = item.imagem;
    imagem.alt = item.nome;
    imagem.loading = 'lazy';
    imagem.decoding = 'async';
    moldura.append(imagem);
  }

  const nome = document.createElement('strong');
  nome.textContent = item.nome;
  const acao = document.createElement('span');
  acao.className = 'presente-card-acao';
  acao.textContent = item.outro ? 'Escrever minha escolha' : 'Escolher presente';
  botao.append(moldura, nome, acao);
  botao.addEventListener('click', () => abrirReservaPresente(item));
  return botao;
};

const renderizarPresentes = () => {
  if (!presentesGrid) return;
  presentesGrid.replaceChildren();
  const disponiveis = presentesConfigurados.filter(item => !presentesReservados.has(item.id));
  disponiveis.forEach(item => presentesGrid.append(criarCartaoPresente(item)));
  presentesGrid.append(criarCartaoPresente(presenteOutro));
  if (!listaPresentesAtiva) return;
  $('presentes-status').textContent = disponiveis.length
    ? `${disponiveis.length} opções disponíveis`
    : 'Todos os presentes da lista já foram escolhidos. Você ainda pode selecionar “Outro presente”.';
};

const carregarReservasPresentes = async () => {
  listaPresentesAtiva = false;
  $('presentes-status').textContent = 'Atualizando presentes disponíveis…';
  renderizarPresentes();
  if (!/^https:\/\//.test(supabasePresentesUrl) || !supabasePresentesChave) {
    $('presentes-status').textContent = 'A lista está sendo preparada pelos noivos.';
    return;
  }
  try {
    const resposta = await fetch(
      `${supabasePresentesUrl}/rest/v1/${tabelaPresentes}?select=presente_id`,
      {
        headers: {
          apikey: supabasePresentesChave,
          Authorization: `Bearer ${supabasePresentesChave}`
        },
        cache: 'no-store'
      }
    );
    if (!resposta.ok) throw new Error('Lista indisponível');
    const reservas = await resposta.json();
    presentesReservados = new Set(
      Array.isArray(reservas) ? reservas.map(item => item.presente_id).filter(Boolean) : []
    );
    listaPresentesAtiva = true;
    renderizarPresentes();
  } catch {
    listaPresentesAtiva = false;
    renderizarPresentes();
    $('presentes-status').textContent = 'A lista ainda está sendo preparada. Tente novamente em instantes.';
  }
};

const abrirListaPresentes = () => {
  if (!presentesModal) return;
  presentesModal.hidden = false;
  bloquearPaginaPresentes();
  carregarReservasPresentes();
  window.setTimeout(() => $('presentes-fechar')?.focus(), 80);
};

const fecharListaPresentes = () => {
  if (!presentesModal) return;
  presentesModal.hidden = true;
  liberarPaginaPresentes();
  $('abrir-presentes')?.focus();
};

function abrirReservaPresente(item) {
  if (!listaPresentesAtiva || !item) return;
  presenteAtual = item;
  window.clearTimeout(retornoPresenteTimer);
  presenteReservaForm?.reset();
  $('presente-reservar').disabled = false;
  $('presente-reservar').textContent = 'Reservar este presente';
  $('presente-reserva-status').textContent = '';

  const imagem = $('presente-selecionado-img');
  const simbolo = $('presente-selecionado-outro');
  const campoOutro = $('presente-outro-campo');
  const inputOutro = $('presente-outro-nome');
  $('presente-selecionado-nome').textContent = item.nome;
  imagem.hidden = Boolean(item.outro);
  simbolo.hidden = !item.outro;
  campoOutro.hidden = !item.outro;
  inputOutro.required = Boolean(item.outro);
  if (!item.outro) {
    imagem.src = item.imagem;
    imagem.alt = item.nome;
  } else {
    imagem.removeAttribute('src');
    imagem.alt = '';
  }

  if (guest) $('presente-convidado-nome').value = guest.slice(0, 100);
  presentesModal.hidden = true;
  presenteReservaModal.hidden = false;
  bloquearPaginaPresentes();
  window.setTimeout(() => (item.outro ? inputOutro : $('presente-convidado-nome'))?.focus(), 80);
}

const voltarParaListaPresentes = () => {
  presenteReservaModal.hidden = true;
  presentesModal.hidden = false;
  renderizarPresentes();
  window.setTimeout(() => $('presentes-fechar')?.focus(), 80);
};

const fecharReservaPresente = () => {
  window.clearTimeout(retornoPresenteTimer);
  presenteReservaModal.hidden = true;
  liberarPaginaPresentes();
  $('abrir-presentes')?.focus();
};

$('abrir-presentes')?.addEventListener('click', abrirListaPresentes);
$('presentes-fechar')?.addEventListener('click', fecharListaPresentes);
$('presente-reserva-fechar')?.addEventListener('click', fecharReservaPresente);
$('presente-voltar')?.addEventListener('click', voltarParaListaPresentes);
presentesModal?.addEventListener('click', event => {
  if (event.target === presentesModal) fecharListaPresentes();
});
presenteReservaModal?.addEventListener('click', event => {
  if (event.target === presenteReservaModal) fecharReservaPresente();
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (presenteReservaModal && !presenteReservaModal.hidden) fecharReservaPresente();
  else if (presentesModal && !presentesModal.hidden) fecharListaPresentes();
});

presenteReservaForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!presenteAtual) return;
  const dados = new FormData(presenteReservaForm);
  if (dados.get('website')) return;
  const nomeConvidado = String(dados.get('nome') || '').trim();
  const presentePersonalizado = String(dados.get('outroPresente') || '').trim();
  const nomePresente = presenteAtual.outro ? presentePersonalizado : presenteAtual.nome;
  if (nomeConvidado.length < 2 || nomePresente.length < 2) {
    $('presente-reserva-status').textContent = 'Preencha seu nome e o presente escolhido.';
    return;
  }

  const idPresente = presenteAtual.outro
    ? `outro-${typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
    : presenteAtual.id;
  const botao = $('presente-reservar');
  botao.disabled = true;
  botao.textContent = 'Reservando…';
  $('presente-reserva-status').textContent = 'Registrando seu presente com carinho…';

  try {
    const resposta = await fetch(`${supabasePresentesUrl}/rest/v1/${tabelaPresentes}`, {
      method: 'POST',
      headers: {
        apikey: supabasePresentesChave,
        Authorization: `Bearer ${supabasePresentesChave}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        presente_id: idPresente,
        presente_nome: nomePresente.slice(0, 120),
        nome_convidado: nomeConvidado.slice(0, 100)
      })
    });

    if (resposta.status === 409 && !presenteAtual.outro) {
      presentesReservados.add(presenteAtual.id);
      $('presente-reserva-status').textContent = 'Este presente acabou de ser escolhido por outra pessoa. Veja as opções que continuam disponíveis.';
      botao.textContent = 'Presente já escolhido';
      retornoPresenteTimer = window.setTimeout(voltarParaListaPresentes, 2400);
      return;
    }
    if (!resposta.ok) throw new Error('Falha ao reservar');

    if (!presenteAtual.outro) presentesReservados.add(presenteAtual.id);
    $('presente-reserva-status').textContent = 'Presente reservado! Muito obrigado por fazer parte deste momento.';
    botao.textContent = 'Presente reservado ✓';
    retornoPresenteTimer = window.setTimeout(voltarParaListaPresentes, 2600);
  } catch {
    $('presente-reserva-status').textContent = 'Não foi possível reservar agora. Tente novamente em alguns instantes.';
    botao.disabled = false;
    botao.textContent = 'Reservar este presente';
  }
});

// Pop-up de confirmação conectado ao Supabase quando configurado.
const rsvpModal = $('rsvp-modal');
const rsvpPopupForm = $('rsvp-popup-form');
const abrirRsvpModal = () => {
  if (!rsvpModal) return;
  rsvpModal.hidden = false;
  document.body.classList.add('modal-aberto');
  window.setTimeout(() => $('rsvp-nome')?.focus(), 80);
};
const fecharRsvpModal = () => {
  if (!rsvpModal) return;
  rsvpModal.hidden = true;
  document.body.classList.remove('modal-aberto');
  $('abrir-rsvp-modal')?.focus();
};
$('abrir-rsvp-modal')?.addEventListener('click', abrirRsvpModal);
$('rsvp-fechar')?.addEventListener('click', fecharRsvpModal);
rsvpModal?.addEventListener('click', event => {
  if (event.target === rsvpModal) fecharRsvpModal();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && rsvpModal && !rsvpModal.hidden) fecharRsvpModal();
});
rsvpPopupForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const status = $('rsvp-popup-status');
  const botao = $('rsvp-enviar');
  const dados = new FormData(rsvpPopupForm);
  if (dados.get('website')) return;
  const nome = String(dados.get('nome') || '').trim();
  const pessoas = Number(dados.get('pessoas'));
  if (nome.length < 2 || !Number.isInteger(pessoas) || pessoas < 1 || pessoas > 20) {
    status.textContent = 'Confira o nome e a quantidade de pessoas.';
    return;
  }
  const supabase = c.supabase || {};
  const url = String(supabase.url || '').replace(/\/$/, '');
  const chave = String(supabase.anonKey || '');
  const tabela = /^[a-z0-9_]+$/i.test(supabase.tabela || '') ? supabase.tabela : 'confirmacoes';
  if (!/^https:\/\//.test(url) || !chave) {
    status.textContent = 'O formulário está pronto. Falta apenas conectar o Supabase.';
    return;
  }
  botao.disabled = true;
  status.textContent = 'Enviando sua confirmação…';
  try {
    const resposta = await fetch(`${url}/rest/v1/${tabela}`, {
      method: 'POST',
      headers: {
        apikey: chave,
        Authorization: `Bearer ${chave}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        nome,
        pessoas,
        convidado: guest ? guest.slice(0, 120) : null
      })
    });
    if (!resposta.ok) throw new Error('Falha ao registrar confirmação');
    rsvpPopupForm.reset();
    status.textContent = 'Presença confirmada! Ficamos muito felizes em celebrar com vocês.';
    botao.textContent = 'Confirmação enviada ✓';
    window.setTimeout(fecharRsvpModal, 2600);
  } catch {
    status.textContent = 'Não foi possível enviar agora. Tente novamente em alguns instantes.';
    botao.disabled = false;
  }
});

// Prévia estática: nenhum dado é enviado ou armazenado.
$('rsvp').addEventListener('submit', event => event.preventDefault());
