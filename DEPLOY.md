# 🚀 Guia Completo para Deploy no GitHub Pages

## ✅ Configurações Já Realizadas

Este projeto já está totalmente configurado para deploy no GitHub Pages! As seguintes configurações foram aplicadas:

### 📁 Arquivos Configurados:
- ✅ `package.json` - Scripts de deploy e dependências
- ✅ `vite.config.ts` - Base path para GitHub Pages
- ✅ `.github/workflows/deploy.yml` - Deploy automático
- ✅ `public/.nojekyll` - Suporte para arquivos com underscore
- ✅ `.gitignore` - Ignorar arquivos desnecessários

## 🚀 Como Fazer o Deploy

### Opção 1: Deploy Automático (Recomendado)

1. **Faça push do código para o GitHub:**
   ```bash
   git add .
   git commit -m "Configuração para GitHub Pages"
   git push origin main
   ```

2. **Habilite o GitHub Pages no seu repositório:**
   - Acesse o seu repositório no GitHub
   - Vá em `Settings` > `Pages`
   - Em `Source`, selecione: `Deploy from a branch`
   - Em `Branch`, selecione: `gh-pages`
   - Em `Folder`, selecione: `/ (root)`
   - Clique em `Save`

3. **Aguarde o deploy automático:**
   - O GitHub Actions será executado automaticamente
   - Você pode acompanhar o progresso em `Actions`
   - O site ficará disponível em: `https://[seu-usuario].github.io/Contador-jogos/`

### Opção 2: Deploy Manual

Se preferir fazer deploy manual:

```bash
# Instalar dependências (se não instalou ainda)
npm install

# Fazer deploy manual
npm run deploy
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa em modo de desenvolvimento
- `npm run build` - Constrói para produção
- `npm run preview` - Visualiza o build de produção
- `npm run deploy` - Deploy manual para GitHub Pages

## 🌐 Acessando o Site

Após o deploy, seu site estará disponível em:
```
https://[seu-usuario].github.io/Contador-jogos/
```

Substitua `[seu-usuario]` pelo seu nome de usuário do GitHub.

## 🔄 Atualizações Automáticas

A partir de agora, sempre que você fizer push na branch `main`, o site será automaticamente atualizado no GitHub Pages!

## ⚠️ Observações Importantes

1. **Nome do repositório**: O projeto está configurado para funcionar com um repositório chamado `Contador-jogos`. Se você renomeou o repositório, atualize o campo `base` no arquivo `vite.config.ts`.

2. **Branch principal**: O deploy automático está configurado para a branch `main`. Se sua branch principal tem outro nome (como `master`), atualize o arquivo `.github/workflows/deploy.yml`.

3. **Primeira execução**: O primeiro deploy pode demorar alguns minutos. Deployments subsequentes são mais rápidos.

## 🐛 Resolução de Problemas

### Deploy falhou?
- Verifique se o GitHub Pages está habilitado
- Verifique se a branch `gh-pages` foi criada
- Consulte os logs em `Actions` no seu repositório

### Site não carrega corretamente?
- Verifique se o campo `base` no `vite.config.ts` corresponde ao nome do seu repositório
- Aguarde alguns minutos para propagação do DNS

### Precisa usar um domínio customizado?
- Crie um arquivo `CNAME` na pasta `public/` com seu domínio
- Configure o DNS do seu domínio para apontar para `[seu-usuario].github.io`

---

🎉 **Parabéns! Seu projeto está pronto para o GitHub Pages!**
