# Contador de Jogos - App Multi-jogador com Cronômetro e Ranking

Este é um aplicativo de cronômetro para jogos multi-jogador com sistema de ranking.

## Funcionalidades

- Cronômetro para múltiplos jogadores
- Sistema de ranking
- Interface responsiva
- Armazenamento local dos dados

## Deploy no GitHub Pages

Este projeto está configurado para deploy automático no GitHub Pages.

### Configuração Inicial

1. **Fork ou clone este repositório**
2. **Habilite o GitHub Pages:**
   - Vá para Settings > Pages no seu repositório
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

### Deploy Automático

O projeto usa GitHub Actions para deploy automático. A cada push na branch `main`, o site será automaticamente construído e publicado no GitHub Pages.

### Deploy Manual

Se preferir fazer deploy manual:

```bash
npm install
npm run deploy
```

## Executar Localmente

**Pré-requisitos:** Node.js

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Execute o app:
   ```bash
   npm run dev
   ```

## Scripts Disponíveis

- `npm run dev` - Executa em modo de desenvolvimento
- `npm run build` - Constrói para produção
- `npm run preview` - Visualiza o build de produção
- `npm run deploy` - Deploy manual para GitHub Pages
