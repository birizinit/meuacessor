-- Script para verificar configuração do Supabase Storage
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar se o bucket 'avatars' existe e é público
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE name = 'avatars';

-- Resultado esperado:
-- Se retornar uma linha com public = true, o bucket está OK!
-- Se public = false, precisa tornar o bucket público

-- 2. Listar todas as políticas RLS para o bucket avatars
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as comando,
  qual as usando,
  with_check
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- Resultado esperado: 4 políticas
-- - Users can upload their own avatars (INSERT)
-- - Avatars are publicly accessible (SELECT)
-- - Users can update their own avatars (UPDATE)
-- - Users can delete their own avatars (DELETE)

-- 3. Verificar se há arquivos no bucket
SELECT 
  name,
  bucket_id,
  created_at,
  updated_at,
  last_accessed_at,
  metadata->>'size' as tamanho_bytes,
  metadata->>'mimetype' as tipo
FROM storage.objects
WHERE bucket_id = 'avatars'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Se o bucket não for público, execute este comando para torná-lo público:
-- UPDATE storage.buckets SET public = true WHERE name = 'avatars';
