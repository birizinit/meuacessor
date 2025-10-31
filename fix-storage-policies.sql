-- Script para Corrigir Políticas RLS do Supabase Storage
-- Execute no SQL Editor do Supabase Dashboard

-- ═══════════════════════════════════════════════════════════════
-- PARTE 1: REMOVER TODAS AS POLÍTICAS ANTIGAS (DUPLICADAS)
-- ═══════════════════════════════════════════════════════════════

-- Dropar todas as políticas existentes para o bucket avatars
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Profile images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile images" ON storage.objects;

-- ═══════════════════════════════════════════════════════════════
-- PARTE 2: CRIAR POLÍTICAS NOVAS E SIMPLIFICADAS
-- ═══════════════════════════════════════════════════════════════

-- 1. POLÍTICA DE INSERT (Upload de imagens)
-- Permite que usuários autenticados façam upload na pasta profiles/
CREATE POLICY "authenticated_users_can_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles'
);

-- 2. POLÍTICA DE SELECT (Leitura pública)
-- Permite que qualquer pessoa veja as imagens
CREATE POLICY "public_can_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 3. POLÍTICA DE UPDATE (Atualizar imagens)
-- Permite que usuários autenticados atualizem imagens na pasta profiles/
CREATE POLICY "authenticated_users_can_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles'
);

-- 4. POLÍTICA DE DELETE (Deletar imagens)
-- Permite que usuários autenticados deletem imagens na pasta profiles/
CREATE POLICY "authenticated_users_can_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles'
);

-- ═══════════════════════════════════════════════════════════════
-- PARTE 3: VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
-- ═══════════════════════════════════════════════════════════════

SELECT 
  policyname,
  cmd as tipo,
  roles as para_quem
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%authenticated%'
ORDER BY policyname;

-- Resultado esperado: 4 políticas
-- - authenticated_users_can_upload (INSERT, authenticated)
-- - authenticated_users_can_update (UPDATE, authenticated)
-- - authenticated_users_can_delete (DELETE, authenticated)
-- - public_can_read (SELECT, public)

-- ═══════════════════════════════════════════════════════════════
-- PARTE 4: GARANTIR QUE O BUCKET É PÚBLICO
-- ═══════════════════════════════════════════════════════════════

-- Verificar se o bucket é público
SELECT id, name, public FROM storage.buckets WHERE name = 'avatars';

-- Se public = false, execute:
UPDATE storage.buckets SET public = true WHERE name = 'avatars';

-- Verificar novamente
SELECT id, name, public FROM storage.buckets WHERE name = 'avatars';
-- Deve mostrar: public = true

-- ═══════════════════════════════════════════════════════════════
-- ✅ PRONTO! As políticas foram simplificadas e corrigidas.
-- ═══════════════════════════════════════════════════════════════

-- NOTA: Estas políticas são mais permissivas e não verificam se o usuário
-- está fazendo upload da sua própria imagem. Se quiser restringir para que
-- cada usuário só possa fazer upload/update/delete de suas próprias imagens,
-- você precisaria adicionar verificação do auth.uid() no caminho do arquivo.
