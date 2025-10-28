# 🔍 Guia de Debug - Sistema de Autenticação

## 🚨 Problema Identificado
O API token não está sendo carregado na página de perfil após o cadastro.

## 🔧 Logs Adicionados
Adicionei logs detalhados em todo o fluxo para identificar onde está o problema:

### 1. **Página de Login (Cadastro)**
- Log dos dados do formulário
- Log do API token enviado
- Log do resultado do signUp

### 2. **AuthContext (SignUp)**
- Log dos dados recebidos
- Log do resultado do Supabase Auth
- Log da criação do perfil no banco

### 3. **API do Usuário**
- Log da busca do usuário
- Log dos dados retornados
- Log do API token encontrado

### 4. **Página de Perfil**
- Log do carregamento dos dados
- Log da resposta da API
- Log do API token carregado

## 🧪 Como Testar

### Passo 1: Configurar Variáveis de Ambiente
1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### Passo 2: Configurar Banco de Dados
Execute este SQL no Supabase SQL Editor:

```sql
-- Criar tabela de usuários
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  sobrenome TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  telefone TEXT NOT NULL,
  nascimento DATE NOT NULL,
  api_token TEXT,
  profile_image TEXT,
  preferences TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Passo 2.1: Verificar e Corrigir Políticas RLS

**Se você receber erro "policy already exists":**
1. Execute o arquivo `simple-rls-fix.sql` (mais seguro)
2. Ou execute o arquivo `check-rls-working.sql` (apenas verificação)

**Se não houver erro:**
1. Execute o arquivo `fix-rls-policies.sql` para corrigir as políticas

### Passo 3: Testar o Fluxo
1. **Execute o servidor:**
   ```bash
   npm run dev
   ```

2. **Abra o console do navegador** (F12 → Console)

3. **Teste o cadastro:**
   - Acesse `/login`
   - Clique em "Criar Conta"
   - Preencha todos os campos **incluindo o API Token**
   - Clique em "Criar Conta"
   - **Verifique os logs no console**

4. **Teste o login:**
   - Faça login com as credenciais criadas
   - **Verifique os logs no console**

5. **Teste a página de perfil:**
   - Acesse `/perfil`
   - **Verifique os logs no console**
   - O API token deve aparecer preenchido

6. **Teste as políticas RLS:**
   - Abra o console do navegador (F12)
   - Cole e execute o código do arquivo `debug-supabase.js`
   - Verifique se o usuário consegue acessar seus dados

## 🔍 Logs Esperados

### No Cadastro:
```
📝 Dados do formulário de cadastro: {nome: "...", api_token: "seu_token"}
🔑 API Token no formulário: seu_token
🔐 Dados do cadastro: {email: "...", userData: {...}}
🔐 Resultado do signUp: {data: {...}, error: null}
🔐 Criando perfil do usuário com dados: {id: "...", api_token: "seu_token"}
✅ Perfil do usuário criado com sucesso!
```

### No Perfil:
```
👤 Carregando dados do usuário...
👤 Resposta da API: 200 true
👤 Dados do usuário carregados: {id: "...", api_token: "seu_token"}
🔑 API token encontrado: seu_token
```

## 🐛 Possíveis Problemas

### 1. **API Token não está sendo enviado no cadastro**
- Verifique se o campo está preenchido no formulário
- Verifique os logs do console

### 2. **Erro ao criar perfil no banco**
- Verifique se a tabela `users` existe
- Verifique se as políticas RLS estão configuradas
- Verifique os logs de erro

### 3. **Erro ao carregar dados do perfil**
- Verifique se o usuário está autenticado
- Verifique se a API `/api/user` está funcionando
- Verifique os logs de erro

### 4. **API Token não aparece no perfil**
- Verifique se foi salvo no banco de dados
- Verifique se está sendo retornado pela API
- Verifique os logs do console

## 🔧 Comandos de Debug

### Verificar estrutura da tabela:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users';
```

### Verificar usuários com API token:
```sql
SELECT id, email, api_token 
FROM users 
WHERE api_token IS NOT NULL;
```

### Verificar usuário específico:
```sql
SELECT * FROM users WHERE email = 'seu_email@exemplo.com';
```

## 📞 Próximos Passos

1. **Execute o teste** seguindo os passos acima
2. **Copie os logs** do console
3. **Verifique o banco de dados** no Supabase
4. **Reporte os resultados** para análise

## 🎯 Objetivo

Identificar exatamente onde o API token está sendo perdido no fluxo:
- ❌ Não está sendo enviado no cadastro?
- ❌ Não está sendo salvo no banco?
- ❌ Não está sendo retornado pela API?
- ❌ Não está sendo carregado no frontend?

Com os logs detalhados, conseguiremos identificar e corrigir o problema!
