-- Migração: Adicionar campo profile_image na tabela users
-- Execute este script no Supabase SQL Editor

-- Verificar se o campo já existe
DO $$
BEGIN
    -- Adicionar o campo profile_image se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'profile_image'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN profile_image TEXT;
        
        -- Adicionar comentário para documentar o campo
        COMMENT ON COLUMN public.users.profile_image IS 'URL da imagem de perfil do usuário';
        
        RAISE NOTICE 'Campo profile_image adicionado com sucesso!';
    ELSE
        RAISE NOTICE 'Campo profile_image já existe na tabela users.';
    END IF;
END $$;

-- Verificar a estrutura atual da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
