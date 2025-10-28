-- Script para verificar e corrigir políticas RLS
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON users;

-- 3. Criar políticas RLS corretas
-- Política para SELECT (visualizar)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Política para INSERT (criar)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para UPDATE (atualizar)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Política para DELETE (deletar) - opcional
CREATE POLICY "Users can delete own profile" ON users
  FOR DELETE USING (auth.uid() = id);

-- 4. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 5. Testar se um usuário específico pode acessar seus dados
-- (Substitua 'user_id_aqui' pelo ID real do usuário)
-- SELECT * FROM users WHERE id = 'user_id_aqui';

-- 6. Verificar se RLS está funcionando
-- Este comando deve retornar apenas os dados do usuário autenticado
SELECT id, email, nome, api_token, created_at 
FROM users 
ORDER BY created_at DESC;
