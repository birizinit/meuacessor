// Script para testar acesso do usuário aos dados
// Execute este script no console do navegador após fazer login

async function testUserAccess() {
  console.log('🧪 Testando acesso do usuário aos dados...')
  
  try {
    // 1. Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await window.supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Usuário não autenticado:', authError)
      return
    }
    
    console.log('✅ Usuário autenticado:', user.id, user.email)
    
    // 2. Testar acesso direto à tabela users
    const { data: userData, error: userError } = await window.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (userError) {
      console.error('❌ Erro ao buscar dados do usuário:', userError)
      return
    }
    
    console.log('✅ Dados do usuário encontrados:', userData)
    console.log('🔑 API Token:', userData.api_token || 'Não encontrado')
    
    // 3. Testar API do usuário
    const response = await fetch('/api/user')
    const apiData = await response.json()
    
    console.log('✅ Dados da API:', apiData)
    console.log('🔑 API Token da API:', apiData.api_token || 'Não encontrado')
    
    // 4. Comparar dados
    if (userData.api_token === apiData.api_token) {
      console.log('✅ API Token consistente entre banco e API')
    } else {
      console.log('❌ API Token inconsistente!')
      console.log('Banco:', userData.api_token)
      console.log('API:', apiData.api_token)
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Função para testar cadastro
async function testSignup() {
  console.log('🧪 Testando cadastro...')
  
  const testData = {
    email: 'teste@exemplo.com',
    password: '123456789',
    userData: {
      nome: 'Teste',
      sobrenome: 'Usuario',
      cpf: '123.456.789-00',
      telefone: '(11) 99999-9999',
      nascimento: '1990-01-01',
      api_token: 'teste_token_123'
    }
  }
  
  try {
    const { data, error } = await window.supabase.auth.signUp({
      email: testData.email,
      password: testData.password,
      options: {
        data: testData.userData
      }
    })
    
    console.log('📝 Resultado do cadastro:', { data, error })
    
    if (!error && data.user) {
      // Criar perfil
      const { error: profileError } = await window.supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          nome: testData.userData.nome,
          sobrenome: testData.userData.sobrenome,
          cpf: testData.userData.cpf,
          telefone: testData.userData.telefone,
          nascimento: testData.userData.nascimento,
          api_token: testData.userData.api_token,
        })
      
      console.log('👤 Resultado da criação do perfil:', { profileError })
    }
    
  } catch (error) {
    console.error('❌ Erro no teste de cadastro:', error)
  }
}

// Executar testes
console.log('🚀 Iniciando testes...')
console.log('Para testar acesso: testUserAccess()')
console.log('Para testar cadastro: testSignup()')
