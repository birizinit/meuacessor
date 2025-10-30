#!/bin/bash

# Script para ajudar a configurar as variáveis de ambiente

echo "🔧 Configuração de Variáveis de Ambiente para Upload de Imagens"
echo "================================================================"
echo ""

# Verificar se o arquivo .env.local já existe
if [ -f ".env.local" ]; then
    echo "⚠️  Arquivo .env.local já existe!"
    echo "Deseja sobrescrevê-lo? (s/N)"
    read -r response
    if [[ ! "$response" =~ ^[Ss]$ ]]; then
        echo "❌ Operação cancelada"
        exit 0
    fi
fi

echo ""
echo "📋 Você precisará das seguintes informações do Supabase:"
echo "   1. Project URL (ex: https://xxxx.supabase.co)"
echo "   2. anon/public key"
echo ""
echo "💡 Encontre essas informações em:"
echo "   Supabase Dashboard → Settings → API"
echo ""

# Solicitar URL do Supabase
echo -n "Digite a NEXT_PUBLIC_SUPABASE_URL: "
read -r SUPABASE_URL

# Solicitar chave anon do Supabase
echo -n "Digite a NEXT_PUBLIC_SUPABASE_ANON_KEY: "
read -r SUPABASE_ANON_KEY

# Validar se as variáveis não estão vazias
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Erro: Ambos os valores são obrigatórios!"
    exit 1
fi

# Criar arquivo .env.local
cat > .env.local << EOF
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

echo ""
echo "✅ Arquivo .env.local criado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Reinicie o servidor: npm run dev"
echo "   2. Configure o bucket 'avatars' no Supabase Storage"
echo "   3. Configure as políticas RLS (veja COMO_CONFIGURAR_IMAGENS.md)"
echo ""
echo "🔍 Para verificar a configuração, execute:"
echo "   node test-storage-diagnosis.mjs"
echo ""
