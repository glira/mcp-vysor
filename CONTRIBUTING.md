# Contribuindo

Obrigado por considerar contribuir com o **mcp-vysor**.

## Como contribuir

1. Faça um fork do repositório
2. Crie uma branch para sua feature ou correção: `git checkout -b feat/minha-feature`
3. Instale dependências e valide o build:
   ```bash
   npm install
   npm run build
   ```
4. Commit com mensagens claras em português ou inglês
5. Abra um Pull Request descrevendo o problema e a solução

## Padrões de código

- TypeScript strict mode
- Mantenha alterações focadas no escopo do PR
- Documente novas ferramentas MCP em `docs/TOOLS.md`
- Atualize `CHANGELOG.md` para mudanças visíveis ao usuário

## Reportar bugs

Abra uma issue incluindo:

- Versão do Node.js (`node -v`)
- Versão do ADB (`adb version`)
- Modelo do dispositivo e versão do Android
- Cliente MCP utilizado (Cursor, Claude Desktop, etc.)
- Passos para reproduzir e logs de erro

## Ambiente de desenvolvimento

```bash
git clone https://github.com/glira/mcp-vysor.git
cd mcp-vysor
npm install
npm run dev
```

Para testar com um dispositivo conectado:

```bash
adb devices
node -e "import {AdbClient} from './dist/adb.js'; const a=new AdbClient(); console.log(await a.listDevices());"
```
