-- Script SQL para corrigir URLs antigas de imagens de perfil
-- Execute este script no Supabase SQL Editor

-- Listar usuários com URLs antigas (para verificação)
SELECT 
  id, 
  profile_image,
  REPLACE(profile_image, '/uploads/', '/api/uploads/') as new_url
FROM users
WHERE profile_image LIKE '/uploads/%'
  AND profile_image NOT LIKE '/api/uploads/%';

-- Atualizar URLs antigas para o novo formato
UPDATE users
SET profile_image = REPLACE(profile_image, '/uploads/', '/api/uploads/')
WHERE profile_image LIKE '/uploads/%'
  AND profile_image NOT LIKE '/api/uploads/%';

-- Verificar resultado
SELECT 
  id, 
  profile_image
FROM users
WHERE profile_image IS NOT NULL;
