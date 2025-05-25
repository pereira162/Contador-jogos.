#!/bin/bash

# 🚀 Script de Deploy Rápido para GitHub Pages
# Execute este script para fazer deploy manual do seu projeto

echo "🔨 Instalando dependências..."
npm install

echo "🏗️  Construindo o projeto..."
npm run build

echo "🚀 Fazendo deploy para GitHub Pages..."
npm run deploy

echo "✅ Deploy concluído!"
echo "📱 Seu site estará disponível em:"
echo "   https://[seu-usuario].github.io/Contador-jogos/"
echo ""
echo "💡 Dica: Para deploy automático, apenas faça push para a branch main!"
