-- Script simples para verificar e corrigir políticas RLS
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar políticas existentes
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 2. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- 3. Se não houver políticas, criar apenas as necessárias
-- (Execute apenas se não houver políticas existentes)

-- Política para SELECT (visualizar)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON users
            FOR SELECT USING (auth.uid() = id);
    END IF;
END $$;

-- Política para INSERT (criar)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON users
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Política para UPDATE (atualizar)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON users
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- 4. Verificar políticas finais
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 5. Testar se RLS está funcionando
-- (Este comando deve retornar apenas os dados do usuário autenticado)
SELECT id, email, nome, api_token, created_at 
FROM users 
ORDER BY created_at DESC;
