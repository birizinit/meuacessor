-- Script para verificar a estrutura do banco de dados
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se a tabela users existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 2. Verificar estrutura da tabela users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se há usuários na tabela
SELECT COUNT(*) as total_usuarios FROM users;

-- 4. Verificar usuários com API token
SELECT id, email, nome, api_token, created_at
FROM users 
WHERE api_token IS NOT NULL 
ORDER BY created_at DESC;

-- 5. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users';

-- 6. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'users';
