# 🔍 Diagnóstico: Storage Já Configurado

## ✅ Boas Notícias!

As políticas RLS já existem! Isso significa que alguém já configurou o Supabase Storage anteriormente.

## 📋 Próximos Passos para Diagnóstico

### 1. Verificar Estado Atual no Supabase

Execute o SQL abaixo no **SQL Editor** do Supabase:

```sql
-- Verificar bucket
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE name = 'avatars';
```

**O que verificar:**
- ✅ O bucket existe?
- ✅ `public = true`? (DEVE SER TRUE!)
- ✅ `allowed_mime_types` está vazio ou contém `image/*`?

### 2. Verificar Políticas Existentes

```sql
SELECT 
  policyname,
  cmd as comando,
  roles
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;
```

**Você deve ver 4 políticas:**
1. ✅ `Users can upload their own avatars` (INSERT)
2. ✅ `Avatars are publicly accessible` (SELECT)
3. ✅ `Users can update their own avatars` (UPDATE)
4. ✅ `Users can delete their own avatars` (DELETE)

Se faltar alguma, precisamos criar.

### 3. Verificar Arquivos no Bucket

```sql
SELECT 
  name,
  bucket_id,
  created_at,
  metadata->>'size' as tamanho_bytes
FROM storage.objects
WHERE bucket_id = 'avatars'
ORDER BY created_at DESC
LIMIT 10;
```

**Procure por:**
- Arquivo: `profile-d00f5272_7881_4f46_a4d1_1c7d68d12d65-1761886579858.png`
- Se NÃO estiver lá → o upload falhou e caiu no fallback local

## 🐛 Possíveis Problemas

### Problema 1: Bucket não é público

**Sintoma:** Bucket existe, mas `public = false`

**Solução:**
```sql
UPDATE storage.buckets 
SET public = true 
WHERE name = 'avatars';
```

### Problema 2: Políticas estão muito restritivas

**Sintoma:** Upload falha com erro de permissão

**Problema comum:** A política de INSERT está verificando se o caminho do arquivo contém o `user_id`, mas pode estar falhando.

**Solução:** Verificar e possivelmente atualizar a política de INSERT:

```sql
-- PRIMEIRO: Dropar a política antiga
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;

-- SEGUNDO: Criar política mais permissiva (para testes)
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles'
);
```

**Nota:** Esta política permite que qualquer usuário autenticado faça upload na pasta `profiles/`. Se quiser restringir para apenas suas próprias imagens, podemos ajustar depois.

### Problema 3: Variáveis de ambiente no Railway

**Sintoma:** O código nem tenta usar o Supabase Storage

**Verificar no Railway:**
1. Vá para o projeto no Railway
2. **Variables** → verifique:
   - `NEXT_PUBLIC_SUPABASE_URL` está configurada?
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` está configurada?

### Problema 4: Políticas estão corretas, mas upload falha

**Possível causa:** A política de INSERT está validando o `auth.uid()` mas o usuário não está autenticado corretamente.

**Debug:** Verifique os logs do Railway quando fizer upload. Procure por:
```
📤 Tentando salvar no Supabase Storage...
⚠️ Erro no Supabase Storage, usando fallback: [MENSAGEM DE ERRO]
```

A `[MENSAGEM DE ERRO]` vai dizer exatamente o que está falhando.

## 🎯 Teste Rápido

### Fazer um Novo Upload

1. Faça login na aplicação em **produção** (Railway)
2. Vá para **Perfil**
3. Faça upload de uma nova imagem
4. **Abra o console do navegador (F12)** e veja os logs

**Se aparecer:**
```
📤 Tentando salvar no Supabase Storage...
⚠️ Erro no Supabase Storage, usando fallback: [ERRO AQUI]
```

**→ Copie a mensagem de erro completa e me envie!**

### Verificar no Supabase

Após o upload (mesmo que tenha falhado):
1. Vá para **Storage** → **avatars** → **profiles**
2. Veja se a imagem apareceu lá
3. Se SIM → o upload funcionou! O problema é só a URL no banco
4. Se NÃO → há um problema de permissão/configuração

## 🔧 Solução Rápida (Se tudo estiver configurado)

Se o bucket existe, é público, e as políticas estão OK, mas o upload continua falhando:

### Opção 1: Tornar a política mais permissiva (temporário)

```sql
-- Dropar políticas existentes
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Criar políticas mais simples
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
```

**Nota:** Estas políticas são mais permissivas e não verificam o user_id. Use apenas para testes!

### Opção 2: Verificar autenticação

O problema pode ser que o usuário não está sendo autenticado corretamente ao fazer upload.

Execute este teste no console do navegador (F12):
```javascript
// Copie e cole isto no console
const { data, error } = await supabase.auth.getSession();
console.log('Sessão:', data);
console.log('Erro:', error);
```

Se retornar `session: null`, o usuário não está autenticado!

## 📊 Checklist de Verificação

Execute na ordem:

- [ ] Bucket `avatars` existe no Supabase Storage
- [ ] Bucket `avatars` está marcado como `public = true`
- [ ] 4 políticas RLS existem (verificar com SQL)
- [ ] Variáveis de ambiente configuradas no Railway
- [ ] Fazer upload de teste e verificar logs do console
- [ ] Verificar se imagem aparece em Storage → avatars → profiles
- [ ] Se não aparecer, copiar mensagem de erro dos logs

## 🆘 Me envie estas informações:

Para eu poder ajudar melhor, me envie:

1. **Resultado do SQL de verificação do bucket:**
```sql
SELECT id, name, public FROM storage.buckets WHERE name = 'avatars';
```

2. **Logs do console do navegador** quando fizer upload (especialmente a linha com `⚠️ Erro no Supabase Storage`)

3. **Verificar se aparece no Storage do Supabase** após o upload

Com essas informações, posso te dizer exatamente qual é o problema! 🎯
