-- Adicionar campo profile_image na tabela users
-- Execute este script no Supabase SQL Editor

-- Adicionar o campo profile_image
ALTER TABLE public.users 
ADD COLUMN profile_image text;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.users.profile_image IS 'URL da imagem de perfil do usuário';

-- Verificar se o campo foi adicionado corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
