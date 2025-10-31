# 🚨 Guia Rápido: Resolver Erro 404 de Imagem de Perfil

## Problema Identificado

```
GET https://meuacessor-production.up.railway.app/uploads/profile-d00f5272_7881_4f46_a4d1_1c7d68d12d65-1761886579858.png 404 (Not Found)
```

**Causa:** A imagem foi salva localmente no servidor Railway, mas o sistema de arquivos é efêmero (arquivos são perdidos após deploys).

**No banco de dados:**
```sql
profile_image = '/uploads/profile-d00f5272_7881_4f46_a4d1_1c7d68d12d65-1761886579858.png'
```

☝️ Este caminho `/uploads/` indica armazenamento local (não funciona no Railway).

## ✅ Solução Completa

### Passo 1: Criar Bucket no Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá para **Storage** no menu lateral
4. Clique em **New bucket**
5. Configure:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **MARCAR COMO PÚBLICO**
   - Clique em **Create bucket**

### Passo 2: Configurar Políticas de Acesso (RLS)

No Supabase Dashboard:

1. Vá para **SQL Editor**
2. Cole e execute cada política abaixo **separadamente**:

#### Política 1: Permitir Upload (INSERT)
```sql
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles'
);
```

#### Política 2: Permitir Leitura Pública (SELECT)
```sql
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### Política 3: Permitir Atualização (UPDATE)
```sql
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles'
);
```

#### Política 4: Permitir Exclusão (DELETE)
```sql
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles'
);
```

### Passo 3: Fazer Novo Upload

Após configurar o bucket:

1. Faça login na aplicação em produção
2. Vá para a página de **Perfil**
3. Clique na imagem de perfil
4. Faça upload de uma **nova** imagem
5. A imagem agora será salva no Supabase Storage e terá uma URL como:
   ```
   https://[seu-projeto].supabase.co/storage/v1/object/public/avatars/profiles/profile-userid-timestamp.png
   ```

### Passo 4: Verificar se Funcionou

#### No Console do Navegador (F12):
Procure por logs como:
```
📤 Tentando salvar no Supabase Storage...
✅ Imagem salva no Supabase Storage: https://...
```

Se aparecer:
```
⚠️ Erro no Supabase Storage, usando fallback: ...
📁 Usando sistema de arquivos local como fallback...
```
**→ O bucket não foi criado corretamente ou as políticas estão faltando!**

#### No Supabase Dashboard:
1. Vá para **Storage** → **avatars** → **profiles**
2. Você deve ver a imagem uploadada
3. Clique na imagem para obter a URL pública

#### No Banco de Dados:
Execute este SQL no Supabase:
```sql
SELECT id, email, nome, profile_image 
FROM users 
WHERE id = 'd00f5272-7881-4f46-a4d1-1c7d68d12d65';
```

A coluna `profile_image` deve ter uma URL do Supabase:
```
https://[projeto].supabase.co/storage/v1/object/public/avatars/profiles/profile-...png
```

## 🔍 Verificação do Bucket (Opcional)

Se você quiser verificar se o bucket está configurado corretamente antes de fazer upload, você pode:

### Opção 1: Via Interface do Supabase
1. Storage → avatars
2. Verifique se o bucket existe
3. Clique em "Policies" para ver as políticas RLS

### Opção 2: Via SQL
Execute no SQL Editor:
```sql
-- Ver todos os buckets
SELECT * FROM storage.buckets;

-- Ver políticas do bucket avatars
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage';
```

## ⚠️ Importante

### Para imagens antigas (que já estão com erro 404):
**Não há como recuperar!** O arquivo foi perdido quando o Railway fez redeploy.

**Solução:** Fazer um novo upload.

### Para prevenir problemas futuros:
- ✅ Configure o bucket `avatars` no Supabase
- ✅ Configure as políticas RLS
- ✅ Sempre verifique os logs após upload
- ✅ Verifique se a URL salva no banco é do Supabase (não `/uploads/`)

## 🎯 Checklist Rápido

- [ ] Bucket `avatars` criado no Supabase
- [ ] Bucket marcado como **público**
- [ ] 4 políticas RLS criadas (INSERT, SELECT, UPDATE, DELETE)
- [ ] Novo upload de imagem feito
- [ ] Imagem aparece no Storage do Supabase
- [ ] URL do banco de dados é do Supabase (não `/uploads/`)
- [ ] Imagem carrega sem erro 404

## 📞 Se ainda não funcionar

Verifique:

1. **Logs do servidor no Railway:**
   - Procure por mensagens como:
     - `📤 Tentando salvar no Supabase Storage...`
     - `⚠️ Erro no Supabase Storage, usando fallback:`
   - Se houver erro, anote a mensagem completa

2. **Variáveis de ambiente no Railway:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Devem estar configuradas corretamente

3. **Políticas RLS:**
   - Execute o SQL de verificação acima
   - Todas as 4 políticas devem aparecer

4. **Bucket público:**
   - Vá para Storage → avatars
   - Clique em "..." → "Edit"
   - Certifique-se que "Public bucket" está marcado

---

**Última atualização:** 2025-10-31  
**Autor:** Cursor AI Agent
