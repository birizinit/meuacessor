-- =========================================
-- CONFIGURAÇÃO DO SUPABASE STORAGE
-- Execute este script no SQL Editor do Supabase
-- =========================================

-- 1. Habilitar RLS no storage.objects (se ainda não estiver habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;

-- =========================================
-- POLÍTICA 1: UPLOAD (INSERT)
-- Permite que usuários autenticados façam upload
-- =========================================
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
);

-- =========================================
-- POLÍTICA 2: LEITURA PÚBLICA (SELECT)
-- Permite que qualquer pessoa veja as imagens
-- =========================================
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- =========================================
-- POLÍTICA 3: ATUALIZAÇÃO (UPDATE)
-- Permite que usuários autenticados atualizem
-- =========================================
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- =========================================
-- POLÍTICA 4: EXCLUSÃO (DELETE)
-- Permite que usuários autenticados excluam
-- =========================================
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- =========================================
-- VERIFICAÇÃO
-- Execute para verificar se as políticas foram criadas
-- =========================================
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;
