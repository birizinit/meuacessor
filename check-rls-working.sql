-- Script para verificar se as políticas RLS estão funcionando
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se RLS está habilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as "RLS Habilitado"
FROM pg_tables 
WHERE tablename = 'users';

-- 2. Verificar políticas existentes
SELECT 
    policyname as "Nome da Política",
    cmd as "Comando",
    permissive as "Permissiva",
    qual as "Condição"
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 3. Verificar se há usuários na tabela
SELECT 
    COUNT(*) as "Total de Usuários",
    COUNT(api_token) as "Usuários com API Token"
FROM users;

-- 4. Verificar estrutura da tabela
SELECT 
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL"
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Testar acesso (deve retornar apenas dados do usuário autenticado)
-- Se retornar dados, as políticas estão funcionando
-- Se retornar erro ou vazio, há problema nas políticas
SELECT 
    id,
    email,
    nome,
    api_token,
    created_at
FROM users 
WHERE id = auth.uid();
