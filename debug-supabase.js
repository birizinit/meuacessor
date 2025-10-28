// Script para debug do Supabase
// Execute no console do navegador

// Verificar configuração do Supabase
console.log('🔧 Configuração do Supabase:')
console.log('URL:', window.supabase.supabaseUrl)
console.log('Key:', window.supabase.supabaseKey ? 'Configurada' : 'Não configurada')

// Verificar se o usuário está autenticado
async function checkAuth() {
  console.log('🔐 Verificando autenticação...')
  
  const { data: { user }, error } = await window.supabase.auth.getUser()
  
  if (error) {
    console.error('❌ Erro de autenticação:', error)
    return null
  }
  
  if (!user) {
    console.log('❌ Usuário não autenticado')
    return null
  }
  
  console.log('✅ Usuário autenticado:', {
    id: user.id,
    email: user.email,
    created_at: user.created_at
  })
  
  return user
}

// Testar acesso à tabela users
async function testTableAccess(user) {
  console.log('📊 Testando acesso à tabela users...')
  
  // Teste 1: Buscar todos os usuários (deve falhar por RLS)
  const { data: allUsers, error: allError } = await window.supabase
    .from('users')
    .select('*')
  
  console.log('🔍 Busca de todos os usuários:', {
    data: allUsers,
    error: allError,
    count: allUsers?.length || 0
  })
  
  // Teste 2: Buscar usuário específico (deve funcionar)
  const { data: userData, error: userError } = await window.supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  console.log('👤 Busca do usuário específico:', {
    data: userData,
    error: userError
  })
  
  return userData
}

// Testar inserção de dados
async function testInsert(user) {
  console.log('➕ Testando inserção de dados...')
  
  const testData = {
    id: user.id,
    email: user.email,
    nome: 'Teste',
    sobrenome: 'Usuario',
    cpf: '123.456.789-00',
    telefone: '(11) 99999-9999',
    nascimento: '1990-01-01',
    api_token: 'teste_token_' + Date.now()
  }
  
  const { data, error } = await window.supabase
    .from('users')
    .upsert(testData)
    .select()
  
  console.log('📝 Resultado da inserção:', {
    data,
    error
  })
  
  return data
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes completos...')
  
  const user = await checkAuth()
  if (!user) return
  
  const userData = await testTableAccess(user)
  if (userData) {
    console.log('✅ Acesso à tabela funcionando')
    console.log('🔑 API Token encontrado:', userData.api_token || 'Não encontrado')
  } else {
    console.log('❌ Problema no acesso à tabela')
  }
  
  // Só testar inserção se não houver dados
  if (!userData) {
    await testInsert(user)
  }
}

// Executar testes
runAllTests()
