// Script para testar conexão com o banco de dados
const { createClient } = require('@supabase/supabase-js')

// Configurações do Supabase (substitua pelas suas)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'SUA_URL_AQUI'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'SUA_CHAVE_AQUI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🔍 Testando conexão com o banco de dados...')
  
  try {
    // Testar conexão básica
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro na conexão:', error)
      return
    }
    
    console.log('✅ Conexão com banco estabelecida!')
    
    // Verificar estrutura da tabela
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError)
      return
    }
    
    console.log('📊 Usuários encontrados:', users.length)
    console.log('📋 Estrutura da tabela:', users[0] ? Object.keys(users[0]) : 'Tabela vazia')
    
    // Verificar se há usuários com API token
    const { data: usersWithToken, error: tokenError } = await supabase
      .from('users')
      .select('id, email, api_token')
      .not('api_token', 'is', null)
    
    if (tokenError) {
      console.error('❌ Erro ao buscar usuários com token:', tokenError)
    } else {
      console.log('🔑 Usuários com API token:', usersWithToken.length)
      usersWithToken.forEach(user => {
        console.log(`  - ${user.email}: ${user.api_token ? 'Token presente' : 'Sem token'}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testDatabase()
