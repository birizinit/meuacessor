// Script de teste para verificar se a imagem de perfil está sendo salva no banco
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProfileImage() {
  try {
    console.log('🔍 Testando sistema de imagem de perfil...')
    
    // Buscar todos os usuários com imagem de perfil
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, profile_image')
      .not('profile_image', 'is', null)
    
    if (error) {
      console.error('❌ Erro ao buscar usuários:', error)
      return
    }
    
    console.log('✅ Usuários com imagem de perfil encontrados:', users.length)
    
    users.forEach((user, index) => {
      console.log(`\n👤 Usuário ${index + 1}:`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Imagem: ${user.profile_image}`)
    })
    
    // Testar inserção de uma imagem de teste
    if (users.length > 0) {
      const testUserId = users[0].id
      const testImageUrl = '/uploads/test-profile-image.jpg'
      
      console.log(`\n🧪 Testando atualização de imagem para usuário ${testUserId}...`)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image: testImageUrl })
        .eq('id', testUserId)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar imagem:', updateError)
      } else {
        console.log('✅ Imagem de teste atualizada com sucesso!')
        
        // Verificar se foi salva
        const { data: updatedUser, error: fetchError } = await supabase
          .from('users')
          .select('profile_image')
          .eq('id', testUserId)
          .single()
        
        if (fetchError) {
          console.error('❌ Erro ao verificar atualização:', fetchError)
        } else {
          console.log('✅ Verificação: Imagem salva no banco:', updatedUser.profile_image)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testProfileImage()
