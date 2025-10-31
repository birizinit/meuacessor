-- ==========================================
-- CONFIGURAÇÃO DO SUPABASE STORAGE
-- ==========================================
-- 
-- Este script configura as políticas de segurança (RLS)
-- para o bucket 'avatars' no Supabase Storage.
-- 
-- IMPORTANTE: Antes de executar este script:
-- 1. Crie o bucket 'avatars' manualmente no Supabase Dashboard
-- 2. Marque o bucket como PÚBLICO (Public bucket)
-- 
-- Como executar:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para SQL Editor
-- 3. Cole este script completo
-- 4. Clique em Run (ou Ctrl+Enter)
-- ==========================================

-- Limpar políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- ==========================================
-- POLÍTICA 1: PERMITIR UPLOAD
-- ==========================================
-- Permite que usuários autenticados façam upload
-- de suas próprias imagens de perfil
-- ==========================================
CREATE POLICY "Users can upload their own avatars"
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles'
);

-- ==========================================
-- POLÍTICA 2: PERMITIR LEITURA PÚBLICA
-- ==========================================
-- Permite que qualquer pessoa (incluindo não autenticados)
-- visualize as imagens de perfil
-- ==========================================
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects 
FOR SELECT 
TO public
USING (
  bucket_id = 'avatars'
);

-- ==========================================
-- POLÍTICA 3: PERMITIR ATUALIZAÇÃO
-- ==========================================
-- Permite que usuários autenticados atualizem
-- suas próprias imagens de perfil
-- ==========================================
CREATE POLICY "Users can update their own avatars"
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'avatars'
);

-- ==========================================
-- POLÍTICA 4: PERMITIR EXCLUSÃO
-- ==========================================
-- Permite que usuários autenticados excluam
-- suas próprias imagens de perfil
-- ==========================================
CREATE POLICY "Users can delete their own avatars"
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'avatars'
);

-- ==========================================
-- VERIFICAÇÃO
-- ==========================================
-- Execute esta query para verificar se as políticas
-- foram criadas corretamente:
-- ==========================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects' 
  AND policyname LIKE '%avatar%'
ORDER BY policyname;

-- Se você vir 4 políticas listadas, está tudo configurado corretamente!
