# Conta de criador na Agensi

A Agensi nao hospeda o servidor MCP. O ZIP abaixo ensina o agente a usar o `mcp-vysor` que o comprador instala localmente (`npx -y mcp-vysor`). GitHub e npm permanecem gratuitos e nao exclusivos.

## 1. Cadastro

1. Abra https://agensi.io e entre com a conta Google de `gemayellira@gmail.com`.
2. Ative **Creator mode** (modo criador) ate aparecer o botao de upload.
3. Dashboard: https://agensi.io (Creator Dashboard / Sell a Skill).

## 2. Pagamentos (Brasil)

1. Conecte uma conta **Stripe** no painel de criador.
2. Se o Stripe nao pagar no Brasil para a sua conta, use **Zoneless** (USDC na Solana, ate 72 horas), como o Joeri descreveu.
3. Voce fica com **70%** das vendas. A Agensi cobre a taxa do Stripe como merchant of record.

## 3. O que enviar

Na raiz deste repositorio, depois de `bash agensi/build-zip.sh`:

| ZIP | Preco sugerido | Conteudo |
|-----|----------------|----------|
| `agensi/zips/mcp-vysor-starter.zip` | Gratis | Setup + fluxo basico screenshot/tap |
| `agensi/zips/mcp-vysor-pro.zip` | US$ 19 a 29 | Playbooks de QA Android |
| `agensi/zips/mcp-tomticket-starter.zip` | Gratis ou US$ 10 a 19 | Helpdesk TomTicket (fase 2) |

Cada ZIP tem `SKILL.md` na raiz (frontmatter `name` e `description`), limite 50 MB. Revisao automatica + manual, em geral ate 24 horas.

## 4. Texto da vitrine (mcp-vysor-pro)

**Titulo:** MCP Vysor Pro — Android visual QA playbooks

**Descricao:** Skill for agents that drive a real Android device through the open-source mcp-vysor MCP (npm). Buyers install the server locally with npx. This pack adds setup templates plus QA playbooks: screenshots, coordinate taps, UI dump, WebView limits, and regression checks. Non-exclusive. Server stays on GitHub and npm.

**Links:**

- https://github.com/glira/mcp-vysor
- https://www.npmjs.com/package/mcp-vysor

## 5. Depois do upload

Starter no ar: https://www.agensi.io/skills/mcp-vysor-starter (tambem em `README.md` e `docs/PUBLISHING.md`). A Pro fica com a URL publica depois da revisao.
