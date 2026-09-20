const c = window.CASAMENTO;
const $ = id => document.getElementById(id);
const text = (id, value) => { $(id).textContent = value; };
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
external('lista', c.listaPresentes);
if ($('lista').getAttribute('href').startsWith('https://')) {
  $('lista').target = '_blank'; $('lista').rel = 'noopener';
} else {
  $('lista').addEventListener('click', event => { event.preventDefault(); $('lista-info').hidden = false; $('lista-info').focus({ preventScroll: true }); });
}
$('abrir-pix').addEventListener('click', () => {
  const open = $('pix-painel').hidden; $('pix-painel').hidden = !open;
  $('abrir-pix').setAttribute('aria-expanded', String(open));
});
$('copiar-pix').addEventListener('click', async () => { try { await navigator.clipboard.writeText(c.pix.chave); text('pix-status', 'Chave copiada!'); } catch { text('pix-status', 'Selecione e copie a chave acima.'); } });
if (/^55\d{10,11}$/.test(c.whatsapp)) external('whatsapp', `https://wa.me/${c.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de falar sobre o casamento.')}`);
// Prévia estática: nenhum dado é enviado ou armazenado.
$('rsvp').addEventListener('submit', event => event.preventDefault());
