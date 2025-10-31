# 🔍 Como Ver os Logs do Railway e Diagnosticar o Problema

## 📋 Passo 1: Acessar os Logs do Railway

1. Acesse: https://railway.app
2. Faça login
3. Selecione o projeto: **meuacessor-production**
4. Clique no serviço da aplicação
5. Vá para a aba **"Deployments"** ou **"Logs"**
6. Você verá os logs em tempo real

## 🔍 Passo 2: Fazer Upload e Observar os Logs

1. **Mantenha os logs do Railway abertos**
2. **Na aplicação**, faça upload de uma nova imagem
3. **Nos logs do Railway**, procure por:

### ✅ Se o Supabase Storage funcionar:
```
📤 Tentando salvar no Supabase Storage...
✅ Imagem salva no Supabase Storage: https://...supabase.co/storage/...
```

### ❌ Se o Supabase Storage falhar (o que está acontecendo):
```
📤 Tentando salvar no Supabase Storage...
⚠️ Erro no Supabase Storage, usando fallback: [MENSAGEM DE ERRO AQUI]
📁 Usando sistema de arquivos local como fallback...
✅ Imagem salva localmente: /uploads/...
```

## 🎯 O Que Procurar

### Erro 1: "Bucket not found"
```
⚠️ Erro no Supabase Storage, usando fallback: Bucket not found
```

**Causa:** O bucket `avatars` não existe no Supabase  
**Solução:** Criar o bucket no Supabase Dashboard

### Erro 2: "new row violates row-level security policy"
```
⚠️ Erro no Supabase Storage, usando fallback: new row violates row-level security policy
```

**Causa:** As políticas RLS estão muito restritivas  
**Solução:** Modificar as políticas (veja abaixo)

### Erro 3: "Invalid API key"
```
⚠️ Erro no Supabase Storage, usando fallback: Invalid API key
```

**Causa:** Variáveis de ambiente não configuradas no Railway  
**Solução:** Configurar as variáveis no Railway

### Erro 4: Sem mensagem de erro, vai direto para fallback
```
📁 Usando sistema de arquivos local como fallback...
```

**Causa:** Variáveis de ambiente vazias ou bucket não existe  
**Solução:** Verificar variáveis de ambiente

## ⚙️ Passo 3: Verificar Variáveis de Ambiente no Railway

1. No Railway, vá para o seu serviço
2. Clique na aba **"Variables"**
3. Verifique se existem:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Se NÃO existirem:

**Adicionar as variáveis:**

1. Vá para o Supabase Dashboard: https://app.supabase.com
2. Selecione seu projeto
3. Vá para **Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. No Railway:
   - Clique em **"New Variable"**
   - Adicione `NEXT_PUBLIC_SUPABASE_URL` = [cole o Project URL]
   - Adicione `NEXT_PUBLIC_SUPABASE_ANON_KEY` = [cole o anon key]
   - Clique em **"Deploy"** para aplicar as mudanças

### Se existirem mas estão vazias ou incorretas:

**Atualizar as variáveis:**

1. Vá para Supabase e copie os valores corretos
2. No Railway, edite as variáveis existentes
3. Cole os valores corretos
4. Clique em **"Deploy"**

## 🔧 Passo 4: Solução para Políticas RLS Muito Restritivas

Se o erro for relacionado a políticas RLS, execute este SQL no Supabase:

```sql
-- 1. Verificar políticas existentes
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- 2. Dropar políticas duplicadas de INSERT
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own profile images" ON storage.objects;

-- 3. Criar UMA política de INSERT simplificada
CREATE POLICY "Allow authenticated users to upload to profiles"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles'
);

-- 4. Garantir que a política de SELECT está OK (leitura pública)
-- Se já existir, não precisa recriar
CREATE POLICY IF NOT EXISTS "Public access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## 🎯 Checklist Completo

- [ ] Logs do Railway acessíveis
- [ ] Fazer upload e ver mensagem de erro nos logs
- [ ] Variáveis de ambiente configuradas no Railway:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Bucket `avatars` criado no Supabase
- [ ] Bucket `avatars` é público
- [ ] Políticas RLS configuradas (simplificadas)
- [ ] Redeploy no Railway após configurar variáveis

## 🚀 Após Configurar Tudo

1. **Redeploy** no Railway (se mudou variáveis de ambiente)
2. **Faça um novo upload** na aplicação
3. **Veja os logs do Railway** → deve aparecer:
   ```
   📤 Tentando salvar no Supabase Storage...
   ✅ Imagem salva no Supabase Storage: https://...
   ```
4. **Verifique no Supabase**:
   - Storage → avatars → profiles
   - A imagem deve estar lá!

## 💡 Dica Rápida

Se você quiser testar rapidamente sem investigar muito:

1. **Vá para o Railway**
2. **Variables** → adicione/verifique as duas variáveis do Supabase
3. **Redeploy**
4. **Teste o upload novamente**

Se ainda cair no fallback local, ENTÃO veja os logs detalhados.

---

**Me envie:**
- ✅ A mensagem de erro que aparece nos **logs do Railway** quando fizer upload
- ✅ Se as variáveis de ambiente existem no Railway (sim/não)
- ✅ Screenshot dos logs se possível

Com isso, vou saber exatamente qual é o problema! 🎯
