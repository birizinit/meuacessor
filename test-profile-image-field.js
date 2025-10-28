// Script de teste para verificar se o campo profile_image existe na tabela users
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProfileImageField() {
  try {
    console.log('🔍 Verificando se o campo profile_image existe na tabela users...')
    
    // Tentar fazer uma consulta que inclua o campo profile_image
    const { data, error } = await supabase
      .from('users')
      .select('id, email, profile_image')
      .limit(1)
    
    if (error) {
      if (error.message.includes('column "profile_image" does not exist')) {
        console.error('❌ Campo profile_image não existe na tabela users!')
        console.log('📝 Execute o script migration-add-profile-image.sql no Supabase SQL Editor')
        return
      } else {
        console.error('❌ Erro ao consultar tabela users:', error)
        return
      }
    }
    
    console.log('✅ Campo profile_image existe na tabela users!')
    console.log('📊 Dados encontrados:', data)
    
    // Testar inserção de uma imagem de teste
    if (data.length > 0) {
      const testUserId = data[0].id
      const testImageUrl = '/uploads/test-profile-image.jpg'
      
      console.log(`\n🧪 Testando atualização de profile_image para usuário ${testUserId}...`)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image: testImageUrl })
        .eq('id', testUserId)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar profile_image:', updateError)
      } else {
        console.log('✅ profile_image atualizado com sucesso!')
        
        // Verificar se foi salvo
        const { data: updatedUser, error: fetchError } = await supabase
          .from('users')
          .select('profile_image')
          .eq('id', testUserId)
          .single()
        
        if (fetchError) {
          console.error('❌ Erro ao verificar atualização:', fetchError)
        } else {
          console.log('✅ Verificação: profile_image salvo no banco:', updatedUser.profile_image)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testProfileImageField()
