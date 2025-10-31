# 🔑 Configuração da Service Role Key do Supabase

## Problema Resolvido
As imagens não estavam sendo enviadas para o bucket `avatars` no Supabase Storage devido a problemas de autenticação via cookies no Railway. A solução implementada usa a **Service Role Key** do Supabase para fazer uploads com segurança no servidor.

## ⚠️ O que foi alterado
O arquivo `/app/api/upload/route.ts` foi modificado para:
1. Usar `createClient` do `@supabase/supabase-js` ao invés de `createServerClient` do `@supabase/ssr`
2. Criar um cliente admin do Supabase usando a Service Role Key
3. Validar o `userId` antes de fazer o upload (segurança)
4. Bypassar as políticas RLS de forma segura no servidor

## 🚀 Como Configurar no Railway

### Passo 1: Obter a Service Role Key do Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** (⚙️) → **API**
4. Na seção **Project API keys**, copie a **service_role** key (⚠️ NUNCA exponha esta chave no frontend!)

### Passo 2: Adicionar a variável no Railway

1. Acesse o [Railway Dashboard](https://railway.app)
2. Selecione seu projeto
3. Clique na sua aplicação
4. Vá na aba **Variables**
5. Clique em **New Variable**
6. Adicione:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Cole a service_role key que você copiou

### Passo 3: Fazer redeploy

Após adicionar a variável:
1. O Railway fará redeploy automático
2. Aguarde o deploy terminar
3. Teste o upload de imagem de perfil

## 🔒 Segurança

A Service Role Key é segura neste contexto porque:
- ✅ Está armazenada apenas no servidor (Railway)
- ✅ Nunca é exposta ao cliente/navegador
- ✅ O código valida o `userId` antes de fazer upload
- ✅ Apenas a API do servidor tem acesso à chave

## 🧪 Verificação

Depois de configurar, os logs do Railway devem mostrar:
```
🔐 Criando cliente Supabase com Service Role Key...
🔍 Validando userId: [user-id]
✅ Usuário validado: [user-id]
📤 Tentando salvar no Supabase Storage...
✅ Imagem salva no Supabase Storage: [url-da-imagem]
```

Se ainda houver erros relacionados ao bucket, verifique:
1. O bucket `avatars` existe no Supabase Storage
2. O bucket está configurado como **público**
3. As políticas RLS estão criadas (execute `setup-storage-policies.sql`)

## 📝 Código de Fallback

Se a Service Role Key não for configurada, o código usará automaticamente a `NEXT_PUBLIC_SUPABASE_ANON_KEY` como fallback, mas isso pode não funcionar devido às políticas RLS. Por isso, é **essencial** configurar a Service Role Key.

## ❓ Troubleshooting

### Erro: "new row violates row-level security policy"
**Solução**: Certifique-se de que a variável `SUPABASE_SERVICE_ROLE_KEY` está configurada no Railway.

### Erro: "The resource was not found"
**Solução**: Verifique se o bucket `avatars` existe no Supabase Storage:
1. Acesse o Supabase Dashboard
2. Vá em **Storage**
3. Se não existir, crie um bucket chamado `avatars`
4. Marque-o como **público**

### Upload ainda cai no fallback local
**Solução**: 
1. Verifique os logs do Railway para ver a mensagem de erro específica
2. Confirme que a Service Role Key está correta
3. Execute o script `setup-storage-policies.sql` no SQL Editor do Supabase
