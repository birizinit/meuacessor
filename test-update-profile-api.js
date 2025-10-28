// Script de teste para a nova API de atualização de perfil
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUpdateProfileAPI() {
  try {
    console.log('🧪 Testando nova API de atualização de perfil...')
    
    // Simular login para obter um userId
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com', // Substitua por um email válido
      password: 'password123'     // Substitua por uma senha válida
    })
    
    if (authError) {
      console.error('❌ Erro de autenticação:', authError.message)
      return
    }
    
    const userId = authData.user.id
    console.log('✅ Usuário autenticado:', userId)
    
    // Testar a nova API
    const testData = {
      userId: userId,
      profileImage: '/uploads/test-profile-image.jpg',
      api_token: 'test-api-token-123'
    }
    
    console.log('📤 Enviando dados para /api/user/update-profile...')
    
    const response = await fetch('http://localhost:5000/api/user/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ API funcionando corretamente:', result)
    } else {
      console.log('❌ Erro na API:', result)
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testUpdateProfileAPI()
