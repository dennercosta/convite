# Convite brasileiro — Denner & Nágila

Versão independente inspirada na estrutura do Ulems (https://ulems.my.id/), estudado em setembro de 2026, e no projeto dewanakl/undangan, tag v3.14.0. Código novo para a versão brasileira; não é uma tradução completa nem atualização oficial do projeto. Não usa a API, as contas bancárias ou as fotografias de demonstração do Ulems. Licença MIT; fonte e crédito da referência em ORIGEM.md.

## 1. Testar no Windows, passo a passo

1. Instale Node.js 24 LTS pelo site oficial https://nodejs.org/ se necessário. O mínimo para este código é 22.13. Confira com `node --version`. Feche e abra o VS Code depois de instalar.
2. Extraia o ZIP para uma pasta própria, por exemplo `C:\Projetos\convite-brasileiro`. Não use a raiz `C:\` nem a pasta do outro casamento Angular.
3. No VS Code, escolha **Arquivo > Abrir Pasta** e selecione a pasta que contém `package.json`, `server.mjs` e esta instrução. Esta é a pasta principal.
4. Abra **Terminal > Novo Terminal**. Execute:

```powershell
npm.cmd run configurar
```

5. Copie e guarde a senha que o terminal mostrar. Ela abre o painel dos noivos. Execute:

```powershell
npm.cmd start
```

6. Deixe o terminal aberto e acesse **http://localhost:8080** no navegador. Clique em **Abrir nosso convite**.
7. Para o painel, abra **http://localhost:8080/admin** e use a senha do passo 5.
8. Para encerrar, clique no terminal e pressione **Ctrl+C**.

Não há dependências externas do npm: não precisa executar npm install. `npm.cmd` evita o erro de política de scripts do PowerShell. Este projeto não usa `ng`, Angular, Firebase nem o servidor do convite anterior. O aviso ExperimentalWarning sobre SQLite em algumas versões do Node não impede o teste.

Se a porta estiver ocupada, no PowerShell execute `$env:PORT="8081"` e depois `npm.cmd start`; use http://localhost:8081. Para testar no celular na mesma rede, configure `$env:HOST="0.0.0.0"`, inicie e use o IP local do computador, liberando a porta apenas na rede privada. A cópia automática de Pix pode depender de HTTPS fora de localhost.

## 2. Personalizar

Edite **public/config.js** e salve. Recarregue o navegador para ver:

- Nomes, iniciais, texto do convite e mensagem cristã.
- Data: há apenas “12 de dezembro”. **O ano, o horário e o fuso estão vazios.** Preencha `dataISO` com a data real para ativar a contagem e a agenda. A agenda reserva uma hora provisória; não define o tempo real do evento.
- Cerimônia e recepção: local, endereço, horário e link HTTPS do mapa.
- História verdadeira, traje e prazo de confirmação.
- Pix: chave, titular e banco. A opção só aparece com chave e titular preenchidos; não há cobrança, QR Code dinâmico nem confirmação de pagamento.
- Lista externa de presentes e WhatsApp com DDI 55 + DDD + número.
- Fotos: crie `public/fotos/`, coloque suas imagens e informe os caminhos. A galeria fica oculta até preencher. Não usamos imagens de pessoas desconhecidas como se fossem os noivos.
- Música opcional em `public/`; só começa após abrir o convite, se o navegador permitir. O botão pausa e retoma.

Para enviar um convite nominal, acrescente ao endereço `?para=Maria%20e%20Jo%C3%A3o`. Isso altera a saudação, mas não funciona como controle de acesso ou lista individual de convidados.

Cores e tamanhos ficam em **public/style.css**. A paleta inicial usa azul-marinho #233f60, azul suave #526f91, azul claro #e7eef5 e papel #faf9f5. Fontes do Google são opcionais: o convite tem fontes de reserva se estiver sem internet.

## 3. O que funciona

Frontend responsivo com abertura, seções, navegação fixa no celular, agenda e contagem quando configuradas, presentes e recados. Backend Node com SQLite: confirmações persistem mesmo depois de fechar e abrir o servidor. Painel com senha, consulta, exportação CSV, exclusão de respostas e aprovação/ocultação de recados.

Nome completo, presença e quantidade só aparecem no painel autenticado. O mural mostra apenas o primeiro nome e o recado, se o convidado autorizar e os noivos aprovarem. Recados são exibidos como texto, nunca como HTML. O servidor valida os campos, limita tentativas e verifica a origem de gravação. A senha é armazenada como hash com salt; sessões expiram após quatro horas e ao reiniciar o servidor.

**Limites:** este é um RSVP por formulário aberto, não uma lista com convites individuais verificados. A mesma pessoa pode preencher de novo. Confira duplicatas e mantenha a resposta mais recente antes de somar convidados. A limitação de tentativas é por IP e fica na memória; atrás de um proxy, os visitantes podem compartilhar esse limite. Não há envio automático de WhatsApp/email, gestão de pagamentos, edição de conteúdo pelo painel nem infraestrutura de produção incluída. O painel permite apagar uma resposta para corrigir ou atender pedido de exclusão.

## 4. Backup e recuperação

Em outro terminal, na mesma pasta:

```powershell
npm.cmd run backup
```

Será criado um arquivo consistente em `backups/`, inclusive se o servidor estiver rodando. Copie-o para outro dispositivo. O backup é manual, não automático. CSV é útil para a organização, mas não substitui o backup do banco.

Para restaurar: pare o servidor; preserve uma cópia da pasta `dados`; retire de `dados` os arquivos `casamento.sqlite`, `casamento.sqlite-wal` e `casamento.sqlite-shm`, se existirem; copie o backup escolhido para `dados/casamento.sqlite`; reinicie. A restauração substitui as respostas atuais. O backup não inclui fotos, configurações ou senha: conserve também `public/` e `dados/admin.json` em armazenamento privado.

Se perder a senha, pare o servidor e execute `npm.cmd run configurar -- --nova-senha`. Guarde a nova senha e reinicie. Não compartilhe as pastas dados e backups nem as envie ao GitHub.

## 5. Colocar na internet

Este ZIP é para execução local e não foi publicado. `localhost` funciona apenas no seu computador. Para compartilhar com convidados será necessário um servidor Node compatível, disco persistente, HTTPS, domínio e backup. Hospedagens apenas estáticas (como GitHub Pages) não executam este backend. O código é gratuito; infraestrutura pode ter custo.

Ao hospedar, defina `HOST=0.0.0.0`, `PORT` conforme o provedor e `PUBLIC_ORIGIN=https://seu-dominio` (origem exata, sem caminho). Use um proxy HTTPS, preserve `dados/` entre implantações e execute uma única instância desse servidor por banco. Configure limites adicionais no proxy se necessário. Não exponha `dados/` ou `backups/` como arquivos públicos. Faça um envio de teste, confira no painel, apague o teste e verifique o backup antes de distribuir o convite.

## Arquivos principais

```text
public/config.js       Informações reais do casamento
public/index.html      Convite
public/style.css       Identidade azul e layout
public/app.js          Interações e envio da confirmação
public/admin.html      Painel dos noivos
public/admin.js        Consulta e moderação
server.mjs             API e banco SQLite
scripts/configurar.mjs Criação da senha
scripts/backup.mjs     Backup consistente
dados/                 Criada ao executar (privada)
```

## Verificações desta entrega

Testado com Node 24.19: confirmação salva, repetição da mesma requisição sem duplicar, senha incorreta, acesso privado ao painel, rejeição de origem externa, validação de campos, aprovação/ocultação, exportação CSV, exclusão, logout e abertura de um backup SQLite com os registros esperados. JavaScript verificado quanto à sintaxe. O navegador automatizado não estava disponível neste ambiente; a aparência em desktop/celular e o fluxo visual completo precisam ser conferidos ao abrir o convite. Esta entrega não foi publicada.
