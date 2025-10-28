// Script de teste para verificar autenticação na API de upload
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUploadAuth() {
  try {
    console.log('🔐 Testando autenticação para upload...')
    
    // Simular login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com', // Substitua por um email válido
      password: 'password123'     // Substitua por uma senha válida
    })
    
    if (authError) {
      console.error('❌ Erro de autenticação:', authError.message)
      return
    }
    
    console.log('✅ Usuário autenticado:', authData.user.id)
    
    // Verificar se a sessão está ativa
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError.message)
      return
    }
    
    if (session) {
      console.log('✅ Sessão ativa encontrada')
      console.log('👤 Usuário da sessão:', session.user.id)
    } else {
      console.log('❌ Nenhuma sessão ativa encontrada')
    }
    
    // Testar upload de uma imagem de teste
    const testImageBuffer = Buffer.from('fake-image-data')
    const testFile = new File([testImageBuffer], 'test.jpg', { type: 'image/jpeg' })
    
    const formData = new FormData()
    formData.append('file', testFile)
    
    console.log('📤 Testando upload...')
    
    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': `sb-access-token=${session.access_token}; sb-refresh-token=${session.refresh_token}`
      }
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Upload bem-sucedido:', result)
    } else {
      console.log('❌ Erro no upload:', result)
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testUploadAuth()

