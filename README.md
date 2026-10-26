# 💳 Fiado do Cartão

App web **pessoal** para controlar quem usou meu cartão de crédito e quanto cada um me deve, fatura por fatura.

Lanço "Roupa · Beatriz · R$ 150 · 3x" e o app calcula em qual fatura cai cada parcela, pelo **dia de fechamento** e **dia de vencimento** do cartão. Os dados ficam na nuvem (Firebase) e sincronizam entre celular e PC. Só a minha conta Google tem acesso.

## Funcionalidades

- **Resumo**: próxima fatura, fatura seguinte, atrasados, total a receber, gráfico por fatura/pessoa e **aviso de vencimento** (quando a fatura fecha ou faltam 7 dias para vencer).
- **Faturas**: navega mês a mês, marca parcelas pagas, botões **Cobrar** e **Recebi** por pessoa.
- **Cobrança no WhatsApp**: mensagem pronta com os itens da fatura, atrasados, total e chave Pix; abre o WhatsApp da pessoa (o número fica salvo).
- **Lançar**: à vista ou parcelado, pela data da compra (fatura calculada sozinha) ou escolhendo a 1ª fatura.
- **Pessoas**: saldo, extrato, histórico de pagamentos, baixa automática das parcelas mais antigas.
- **Relatório**: total do ano, média por fatura, quem mais usou, recebido no ano, ranking e tabela pessoa × fatura.
- **Ajustes**: fechamento/vencimento, chave Pix, importar/exportar CSV, backup JSON, conta.
- **App instalável (PWA)**: ícone próprio na tela inicial e abre em tela cheia, mesmo com internet fraca.
- **Sobre**: versão, autor, como funciona, privacidade, créditos com licenças e histórico de versões (⚙ Ajustes → Sobre o app, ou link no rodapé).

## Histórico de versões

| Versão | Data | Mudanças |
|---|---|---|
| v2.1 | 26/10/2026 | Tela Sobre com créditos, licenças e histórico |
| v2.0 | 25/10/2026 | Cobrança pelo WhatsApp, aviso de vencimento, Relatório, PWA |
| v1.1 | 25/10/2026 | Login com Google e dados no Firebase |
| v1.0 | 25/10/2026 | Primeira versão |

**Regra das faturas:** compra **antes** do fechamento entra na fatura aberta; **no dia ou depois**, vai para a seguinte. A fatura é identificada pelo mês em que **vence**.

## Arquivos

| Arquivo | Para quê | Vai pro Git? |
|---|---|---|
| `index.html` | O app inteiro | ✅ |
| `manifest.webmanifest` | Nome, cores e ícones do app instalado (PWA) | ✅ |
| `sw.js` | Service worker: deixa o app instalável e abrir rápido/offline | ✅ |
| `icons/` | Ícones do app (192, 512, maskable e Apple) | ✅ |
| `.nojekyll` | Faz o GitHub Pages servir os arquivos direto | ✅ |
| `firebase-config.js` | Config do projeto Firebase (não é senha) | ✅ |
| `firestore.rules` | Regras de segurança, travadas no meu UID | ✅ |
| `firebase.json` / `.firebaserc` | Usados pelo Firebase CLI para publicar as regras | ✅ |
| `.gitignore` | Bloqueia CSV e backups | ✅ |
| `*.csv`, `fiado-backup*.json` | Meus dados | ❌ nunca |

---

## Parte 1 — Firebase (console)

1. Acesse <https://console.firebase.google.com> → **Adicionar projeto** → nome `fiado-do-cartao` → pode desativar o Google Analytics → **Criar**.
2. **Registrar o app web:** na página do projeto, clique no ícone **`</>`** (Web) → apelido `fiado-web` → **não** marque Firebase Hosting → **Registrar app**.
   Copie o objeto `firebaseConfig` que aparece e cole os valores em **`firebase-config.js`**.
3. **Login com Google:** menu **Criação → Authentication → Vamos começar → Sign-in method → Google → Ativar** → escolha seu e-mail de suporte → **Salvar**.
4. **Domínio autorizado:** ainda em Authentication → **Configurações → Domínios autorizados → Adicionar domínio** → `jacobbv.github.io`.
   (`localhost` já vem liberado para testar no PC.)
5. **Banco de dados:** **Criação → Firestore Database → Criar banco de dados** → local `southamerica-east1 (São Paulo)` → **Iniciar no modo de produção** → **Criar**.
   O modo de produção começa bloqueando tudo, o que é o que a gente quer.

## Parte 2 — Regras de segurança

As regras só deixam a **minha** conta ler e gravar. Como o UID só existe depois do primeiro login, o processo é:

1. Publique as regras como estão (com `COLE_SEU_UID_AQUI`). Ninguém consegue acessar ainda, nem eu.
2. Abra o app e faça login com Google. Vai aparecer **"não tem permissão"** junto com o **seu UID** e um botão **Copiar UID**.
3. Cole o UID em `firestore.rules`, no lugar de `COLE_SEU_UID_AQUI`.
4. Publique as regras de novo e clique em **Recarregar** no app. Pronto.

O UID também fica em ⚙ Ajustes → **Copiar meu UID**.

### Publicar as regras pelo terminal (Firebase CLI)

Precisa do [Node.js](https://nodejs.org) instalado.

```bash
npm install -g firebase-tools        # instala o Firebase CLI (só uma vez)
firebase login                       # abre o navegador para entrar com sua conta Google
cd fiado-do-cartao
firebase use --add                   # escolha o projeto fiado-do-cartao, apelido: default
firebase deploy --only firestore:rules
```

Toda vez que mudar `firestore.rules`, rode só o último comando.

### Ou publicar pelo console (sem instalar nada)

Firestore Database → aba **Regras** → apague o que tem, cole o conteúdo de `firestore.rules` → **Publicar**.

## Parte 3 — Testar no PC (opcional)

O login do Google não funciona abrindo o arquivo direto (`file://`). Suba um servidorzinho local:

```bash
cd fiado-do-cartao
python -m http.server 8000
```

Abra <http://localhost:8000>.

## Parte 4 — Git e GitHub Pages

Crie o repositório vazio `fiado-do-cartao` em <https://github.com/new> (sem README, para não dar conflito). Depois:

```bash
cd fiado-do-cartao
git init
git add index.html firebase-config.js firestore.rules firebase.json .firebaserc .gitignore README.md
git status                           # confira: nenhum .csv nem backup na lista
git commit -m "Fiado do Cartão com Firebase (login Google + Firestore)"
git branch -M main
git remote add origin https://github.com/JacobbV/fiado-do-cartao.git
git push -u origin main
```

No GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.

Em 1 ou 2 minutos fica no ar em **<https://jacobbv.github.io/fiado-do-cartao/>**.

Atualizações futuras:

```bash
git add .
git commit -m "descreva a mudança"
git push
```

## Parte 5 — Primeiro uso

1. Abra o app, faça login com Google e libere seu UID nas regras (Parte 2).
2. ⚙ **Ajustes** → informe o dia de **fechamento** e de **vencimento** do cartão.
3. ⚙ **Ajustes → Importar CSV** → escolha o `lancamentos_contas_completos.csv`.
4. No celular, abra o link no Chrome → menu ⋮ → **Adicionar à tela inicial** para virar "app".

## Segurança extra (recomendado)

Restringir a API key ao seu site, para ninguém usar a chave em outro lugar:

1. <https://console.cloud.google.com/apis/credentials> → selecione o projeto `fiado-do-cartao`.
2. Clique na chave **Browser key (auto created by Firebase)**.
3. **Restrições de aplicativo → Sites** → adicione:
   - `https://jacobbv.github.io/*`
   - `http://localhost:8000/*`
   - `https://SEU_PROJETO.firebaseapp.com/*` (necessário para o login do Google)
4. **Salvar**.

## Formato do CSV

```
data;pessoa;descricao;valor;parcela;status
2026-11;Beatriz;Roupa;50.00;1/3;pendente
2026-10-10;Beatriz;Pix de outubro;-150.00;;pago
```

- `data`: mês da fatura (`AAAA-MM`) para compras; data do pagamento para pagamentos.
- `valor` negativo = pagamento recebido.
- `status`: `pago` ou `pendente`.

## Estrutura no Firestore

```
usuarios/{meu-uid}/fiado/dados
  config:     { fechamento, vencimento, pix }
  contatos:   { "Beatriz": "83999990000", ... }
  itens:      [ { id, grupo, pessoa, descricao, valor, fatura: "AAAA-MM", parcela: "1/3", pago } ]
  pagamentos: [ { id, pessoa, valor, data, obs } ]
```

Um único documento. O limite do Firestore é 1 MB por documento, o que dá vários milhares de parcelas.
O plano gratuito (Spark) cobre esse uso com folga.

## Créditos e licenças

| Recurso | Uso | Licença / termos | Fonte |
|---|---|---|---|
| [Firebase JS SDK](https://github.com/firebase/firebase-js-sdk) v10.14.1 | Login e banco de dados | [Apache 2.0](https://github.com/firebase/firebase-js-sdk/blob/main/LICENSE) | servido por `www.gstatic.com` |
| [Firebase Authentication](https://firebase.google.com/docs/auth) e [Cloud Firestore](https://firebase.google.com/docs/firestore) | Serviços do Google | [Termos do Firebase](https://firebase.google.com/terms) | Google |
| [Chart.js](https://www.chartjs.org/) v4.4.1 | Gráfico | [MIT](https://github.com/chartjs/Chart.js/blob/master/LICENSE.md) | [cdnjs](https://cdnjs.com/libraries/Chart.js) |
| Logotipo "G" do Google | Botão de login | [Diretrizes de marca do Google Sign-In](https://developers.google.com/identity/branding-guidelines) | Google |
| Link `wa.me` do WhatsApp | Abrir conversa com a mensagem de cobrança | [Termos do WhatsApp](https://www.whatsapp.com/legal/terms-of-service) — WhatsApp é marca da Meta; o app não usa o logotipo | WhatsApp |
| GitHub Pages | Hospedagem | [Termos do GitHub](https://docs.github.com/pt/site-policy/github-terms/github-terms-of-service) | GitHub |

Logotipo, ícones do PWA (`icons/`) e ícones da interface desenhados pelo autor. Fontes do sistema.

## Autor

Jacó ([@JacobbV](https://github.com/JacobbV)), Catolé do Rocha-PB. Uso pessoal.
