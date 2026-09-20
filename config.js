// Edite aqui. Campos vazios ficam ocultos ou aparecem como "a informar".
// Nunca coloque senhas neste arquivo: ele é público.
window.CASAMENTO = {
  noivos: "Denner & Nágila",
  iniciais: "D & N",
  dataTexto: "12 • 12 • 2026",
  dataCasamento: "2026-12-12",
  fuso: "America/Sao_Paulo", // Ajuste se o local usar outro fuso.
  // Cerimônia confirmada: 12/12/2026 às 16h, horário de Goiás.
  // Sem horário, a contagem mostra apenas os dias até 12/12/2026.
  // Formato: AAAA-MM-DDTHH:mm:ss-03:00 (use o fuso da cidade).
  dataISO: "2026-12-12T16:00:00-03:00",
  convite: "Com a bênção de Deus e muito amor, convidamos você para celebrar o início da nossa família.",
  mensagemFe: "Que o amor, a fé e a presença de Deus guiem cada passo da nossa caminhada.",
  referenciaBiblica: "1 Coríntios 13:4–7",
  historia: "", // Sua história verdadeira. A seção fica oculta enquanto estiver vazia.
  celebracao: { local: "Sítio Paraíso - Nerópolis", endereco: "", horario: "16h", mapa: "https://maps.app.goo.gl/5gzfruJ4vFBVpftA9" }, // Cerimônia e recepção no mesmo local.
  traje: "", // Ex.: Esporte fino. Informe apenas o traje escolhido por vocês.
  prazoConfirmacao: "",
  pix: { chave: "", titular: "", banco: "" },
  listaPresentes: "", // URL https:// da lista, se houver.
  whatsapp: "", // DDI + DDD + número, apenas dígitos: 55...
  fotoCapa: "", // Ex.: /fotos/casal.jpg — coloque o arquivo em public/fotos/.
  fotos: [], // Ex.: [{ src: "/fotos/casal.jpg", legenda: "Nosso momento" }]
  musica: "" // Ex.: /musica.mp3. Use uma faixa que você tenha direito de compartilhar.
};
