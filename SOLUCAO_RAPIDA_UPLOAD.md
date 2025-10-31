# 🚀 Solução Rápida: Upload de Imagem no Supabase Storage

## 🎯 Problema Identificado

A imagem está sendo salva **localmente** (`/uploads/`) em vez de usar o **Supabase Storage**, por isso dá erro 404 no Railway (sistema de arquivos efêmero).

## ✅ Solução em 3 Passos Simples

### Passo 1: Configurar Variáveis de Ambiente no Railway

**Esse é provavelmente o problema principal!**

1. Acesse: https://railway.app
2. Vá para o projeto **meuacessor-production**
3. Clique no serviço (sua aplicação)
4. Vá para a aba **"Variables"**

5. **Verifique se existem estas variáveis:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

6. **Se NÃO existirem ou estiverem vazias:**
   
   a. Vá para o Supabase Dashboard: https://app.supabase.com
   
   b. Selecione seu projeto
   
   c. Vá para **Settings** → **API**
   
   d. Copie:
      - **Project URL** 
      - **anon public** key
   
   e. Volte para o Railway e adicione as variáveis:
      - Nome: `NEXT_PUBLIC_SUPABASE_URL`
      - Valor: [cole o Project URL]
      
      - Nome: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      - Valor: [cole o anon public key]
   
   f. **Importante:** Após adicionar/editar variáveis, o Railway fará **redeploy automático**

### Passo 2: Simplificar Políticas RLS (Limpar Duplicatas)

1. Vá para o Supabase Dashboard: https://app.supabase.com
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Cole e execute o conteúdo do arquivo: **`fix-storage-policies.sql`**
5. Execute linha por linha ou tudo de uma vez

**O que este script faz:**
- ✅ Remove as 8 políticas duplicadas
- ✅ Cria 4 políticas novas e simplificadas
- ✅ Garante que o bucket é público

### Passo 3: Testar o Upload

1. **Aguarde o redeploy** do Railway terminar (se você mudou as variáveis)
2. **Acesse a aplicação** em produção
3. **Faça login**
4. **Vá para o Perfil**
5. **Faça upload de uma nova imagem**

## 🔍 Verificar se Funcionou

### No Console do Navegador (F12):
Você deve ver:
```
✅ Upload da imagem bem-sucedido: https://...supabase.co/storage/v1/object/public/avatars/profiles/...
```

❌ Se ainda aparecer `/uploads/...`, vá para o Passo 4.

### Nos Logs do Railway:
Você deve ver:
```
🔍 Verificando configuração do Supabase Storage...
   SUPABASE_URL: ✓ Configurada
   SUPABASE_KEY: ✓ Configurada
📤 Tentando salvar no Supabase Storage...
   Bucket: avatars
   Path: profiles/profile-...
✅ Imagem salva no Supabase Storage: https://...
```

### No Supabase Storage:
1. Vá para **Storage** → **avatars** → **profiles**
2. A imagem deve estar lá!

## 🆘 Passo 4: Se Ainda Não Funcionar

### Ver os Logs Detalhados do Railway

1. No Railway, vá para **Deployments**
2. Clique no último deployment
3. Veja os logs em tempo real
4. Faça upload de uma imagem
5. **Procure por estas mensagens:**

#### ❌ Se aparecer:
```
🔍 Verificando configuração do Supabase Storage...
   SUPABASE_URL: ✗ NÃO configurada
   SUPABASE_KEY: ✗ NÃO configurada
```

**→ PROBLEMA:** Variáveis de ambiente não configuradas  
**→ SOLUÇÃO:** Volte ao Passo 1 e configure corretamente

#### ❌ Se aparecer:
```
⚠️ Erro no Supabase Storage, usando fallback: Bucket not found
```

**→ PROBLEMA:** Bucket `avatars` não existe  
**→ SOLUÇÃO:** 
1. Vá para Supabase Dashboard → Storage
2. Crie um bucket chamado `avatars`
3. Marque como **público**

#### ❌ Se aparecer:
```
⚠️ Erro no Supabase Storage, usando fallback: new row violates row-level security policy
```

**→ PROBLEMA:** Políticas RLS muito restritivas  
**→ SOLUÇÃO:** Execute o `fix-storage-policies.sql` novamente

#### ❌ Se aparecer:
```
⚠️ Erro no Supabase Storage, usando fallback: Invalid API key
```

**→ PROBLEMA:** Chave API incorreta  
**→ SOLUÇÃO:** Verifique se copiou a chave correta do Supabase

## 📊 Checklist Final

- [ ] Variáveis de ambiente configuradas no Railway
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Redeploy feito no Railway
- [ ] Bucket `avatars` existe no Supabase
- [ ] Bucket `avatars` é público
- [ ] Políticas RLS simplificadas executadas
- [ ] Teste de upload realizado
- [ ] Imagem aparece no Supabase Storage
- [ ] URL no banco de dados é do Supabase (não `/uploads/`)

## 🎯 Resultado Esperado

Após configurar tudo:

1. **Upload de imagem** → salva no Supabase Storage ✅
2. **URL no banco** → `https://...supabase.co/storage/v1/object/public/avatars/profiles/...` ✅
3. **Imagem carrega** → sem erro 404 ✅
4. **Imagem persiste** → mesmo após redeploy ✅

## 💡 Por Que Isso É Importante?

- ❌ **Antes:** Imagem salva localmente → perdida após redeploy → erro 404
- ✅ **Depois:** Imagem salva no Supabase → permanente → funciona sempre

---

**Próximos passos:**

1. ✅ Configure as variáveis de ambiente no Railway (Passo 1)
2. ✅ Execute o SQL de políticas (Passo 2)
3. ✅ Teste o upload (Passo 3)
4. ✅ **Me envie os logs do Railway** se ainda não funcionar

**Arquivos importantes:**
- `fix-storage-policies.sql` - Execute este no Supabase
- `COMO_VER_LOGS_RAILWAY.md` - Guia detalhado dos logs
- `/app/api/upload/route.ts` - Código atualizado com logs de debug
