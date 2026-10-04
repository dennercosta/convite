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
  celebracao: { local: "Sítio Paraíso - Macaúba", endereco: "Nerópolis/GO", horario: "16:00", mapa: "https://maps.app.goo.gl/RWsbPRLrLQ8YapE16" }, // Cerimônia e recepção no mesmo local.
  traje: "", // Ex.: Esporte fino. Informe apenas o traje escolhido por vocês.
  prazoConfirmacao: "01 de novembro de 2026",
  pix: { chave: "", titular: "", banco: "" },
  listaPresentes: "", // URL https:// da lista, se houver.
  presentes: [
    { id: "presente-01", nome: "Purificador de água", imagem: "./assets/presentes/01-purificador.webp" },
    { id: "presente-02", nome: "Fogão", imagem: "./assets/presentes/02-fogao.webp" },
    { id: "presente-03", nome: "Geladeira", imagem: "./assets/presentes/03-geladeira.webp" },
    { id: "presente-04", nome: "Cafeteira", imagem: "./assets/presentes/04-cafeteira.webp" },
    { id: "presente-05", nome: "Liquidificador", imagem: "./assets/presentes/05-liquidificador.webp" },
    { id: "presente-06", nome: "Air Fryer", imagem: "./assets/presentes/06-air-fryer.webp" },
    { id: "presente-07", nome: "Micro-ondas", imagem: "./assets/presentes/07-micro-ondas.webp" },
    { id: "presente-08", nome: "Mesa de jantar", imagem: "./assets/presentes/08-mesa-de-jantar.webp" },
    { id: "presente-09", nome: "Pipoqueira", imagem: "./assets/presentes/09-pipoqueira.webp" },
    { id: "presente-10", nome: "Sanduicheira", imagem: "./assets/presentes/10-sanduicheira.webp" },
    { id: "presente-11", nome: "Cama de casal", imagem: "./assets/presentes/11-cama-de-casal.webp" },
    { id: "presente-12", nome: "Guarda-roupa", imagem: "./assets/presentes/12-guarda-roupa.webp" },
    { id: "presente-13", nome: "Climatizador", imagem: "./assets/presentes/13-climatizador.webp" },
    { id: "presente-14", nome: "Cabeceira para cama de casal", imagem: "./assets/presentes/14-cabeceira-cama-casal.webp" },
    { id: "presente-15", nome: "Ar-condicionado", imagem: "./assets/presentes/15-ar-condicionado.webp" },
    { id: "presente-16", nome: "Criado-mudo", imagem: "./assets/presentes/16-criado-mudo.webp" },
    { id: "presente-17", nome: "Edredom", imagem: "./assets/presentes/17-edredom.webp" },
    { id: "presente-18", nome: "Jogo de lençóis", imagem: "./assets/presentes/18-jogo-de-lencois.webp" },
    { id: "presente-19", nome: "Penteadeira", imagem: "./assets/presentes/19-penteadeira.webp" },
    { id: "presente-20", nome: "TV", imagem: "./assets/presentes/20-tv.webp" },
    { id: "presente-21", nome: "Painel para TV", imagem: "./assets/presentes/21-painel-tv.webp" },
    { id: "presente-22", nome: "Sofá", imagem: "./assets/presentes/22-sofa.webp" },
    { id: "presente-23", nome: "Kit para churrasco", imagem: "./assets/presentes/23-kit-churrasco.webp" },
    { id: "presente-24", nome: "Armário para despensa", imagem: "./assets/presentes/24-armario-despensa.webp" },
    { id: "presente-25", nome: "Estante de livros", imagem: "./assets/presentes/25-estante-livros.webp" },
    { id: "presente-26", nome: "Churrasqueira", imagem: "./assets/presentes/26-churrasqueira.webp" },
    { id: "presente-27", nome: "Cortina", imagem: "./assets/presentes/27-cortina.webp" },
    { id: "presente-28", nome: "Churrasqueira elétrica", imagem: "./assets/presentes/28-churrasqueira-eletrica.webp" },
    { id: "presente-29", nome: "Jogo de toalhas", imagem: "./assets/presentes/29-jogo-toalhas.webp" },
    { id: "presente-30", nome: "Sapateira", imagem: "./assets/presentes/30-sapateira.webp" },
    { id: "presente-31", nome: "Colcha", imagem: "./assets/presentes/31-colcha.webp" }
  ],
  whatsapp: "", // DDI + DDD + número, apenas dígitos: 55...
  // A chave anon/publishable é pública por definição. Nunca use a service_role no site.
  supabase: {
    url: "https://hrorbyvmpcaeadqnqioc.supabase.co",
    anonKey: "sb_publishable_Aapfyxf9NDxce_0Gj83jwg_l0JQVtRW",
    tabela: "confirmacoes",
    tabelaPresentes: "presentes_reservados"
  },
  fotoCapa: "", // Ex.: /fotos/casal.jpg — coloque o arquivo em public/fotos/.
  fotos: [], // Ex.: [{ src: "/fotos/casal.jpg", legenda: "Nosso momento" }]
  musica: "" // Ex.: /musica.mp3. Use uma faixa que você tenha direito de compartilhar.
};
