#!/usr/bin/env node

/**
 * Teste de Upload no Supabase Storage
 * Este script testa se conseguimos fazer upload para o bucket avatars
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Buscar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testando Upload no Supabase Storage\n');
console.log('═══════════════════════════════════════════════════════\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  console.error('   Configure no Railway:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY\n');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente encontradas');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageUpload() {
  console.log('📦 Verificando bucket "avatars"...\n');
  
  // 1. Listar buckets
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets();
  
  if (bucketsError) {
    console.error('❌ Erro ao listar buckets:', bucketsError.message);
    return false;
  }
  
  const avatarsBucket = buckets.find(b => b.name === 'avatars');
  
  if (!avatarsBucket) {
    console.error('❌ Bucket "avatars" não encontrado!');
    return false;
  }
  
  console.log('✅ Bucket "avatars" encontrado');
  console.log(`   Público: ${avatarsBucket.public ? 'Sim ✓' : 'Não ✗'}`);
  
  if (!avatarsBucket.public) {
    console.log('\n⚠️  PROBLEMA ENCONTRADO: Bucket não é público!');
    console.log('   Execute no SQL Editor do Supabase:');
    console.log('   UPDATE storage.buckets SET public = true WHERE name = \'avatars\';\n');
    return false;
  }
  
  // 2. Criar um arquivo de teste
  console.log('\n📄 Criando arquivo de teste...');
  
  const testFileName = `test-upload-${Date.now()}.txt`;
  const testFilePath = `profiles/${testFileName}`;
  const testContent = 'Este é um arquivo de teste para verificar o upload no Supabase Storage.';
  
  console.log(`   Arquivo: ${testFilePath}\n`);
  
  // 3. Tentar fazer upload SEM autenticação (deve funcionar se as políticas permitirem)
  console.log('🔓 Teste 1: Upload sem autenticação...');
  
  const { data: uploadData1, error: uploadError1 } = await supabase
    .storage
    .from('avatars')
    .upload(testFilePath, testContent, {
      contentType: 'text/plain',
      upsert: false
    });
  
  if (uploadError1) {
    console.log('❌ Upload sem autenticação FALHOU');
    console.log(`   Erro: ${uploadError1.message}`);
    
    if (uploadError1.message.includes('policy')) {
      console.log('\n💡 PROBLEMA IDENTIFICADO: Política RLS muito restritiva!');
      console.log('   A política requer autenticação, mas o upload está sendo feito sem sessão.\n');
      console.log('📋 SOLUÇÃO: Modificar a política de INSERT para ser mais permissiva:');
      console.log(`
-- Execute no SQL Editor:
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own profile images" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');
      `);
    }
    
    return false;
  } else {
    console.log('✅ Upload sem autenticação FUNCIONOU!');
    console.log(`   Arquivo criado: ${uploadData1.path}\n`);
    
    // Obter URL pública
    const { data: { publicUrl } } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(testFilePath);
    
    console.log('🌐 URL Pública:');
    console.log(`   ${publicUrl}\n`);
    
    // Limpar arquivo de teste
    console.log('🧹 Limpando arquivo de teste...');
    const { error: deleteError } = await supabase
      .storage
      .from('avatars')
      .remove([testFilePath]);
    
    if (deleteError) {
      console.log('⚠️  Não foi possível deletar o arquivo de teste');
      console.log(`   Erro: ${deleteError.message}`);
      console.log('   Você pode deletar manualmente no Supabase Dashboard\n');
    } else {
      console.log('✅ Arquivo de teste removido\n');
    }
    
    return true;
  }
}

async function testImageUpload() {
  console.log('🖼️  Teste 2: Simulando upload de imagem...\n');
  
  // Criar um PNG mínimo válido (1x1 pixel transparente)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);
  
  const testImageName = `test-image-${Date.now()}.png`;
  const testImagePath = `profiles/${testImageName}`;
  
  console.log(`   Arquivo: ${testImagePath}`);
  console.log(`   Tamanho: ${pngBuffer.length} bytes\n`);
  
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('avatars')
    .upload(testImagePath, pngBuffer, {
      contentType: 'image/png',
      upsert: false
    });
  
  if (uploadError) {
    console.log('❌ Upload de imagem FALHOU');
    console.log(`   Erro: ${uploadError.message}\n`);
    
    if (uploadError.message.includes('policy')) {
      console.log('💡 Problema de permissão RLS detectado!');
    } else if (uploadError.message.includes('Bucket not found')) {
      console.log('💡 Bucket não encontrado!');
    } else if (uploadError.message.includes('authenticated')) {
      console.log('💡 Requer autenticação!');
    }
    
    return false;
  }
  
  console.log('✅ Upload de imagem FUNCIONOU!');
  console.log(`   Path: ${uploadData.path}\n`);
  
  // Obter URL pública
  const { data: { publicUrl } } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(testImagePath);
  
  console.log('🌐 URL Pública da Imagem:');
  console.log(`   ${publicUrl}\n`);
  
  console.log('💡 Teste a URL acima no navegador para ver se a imagem carrega!\n');
  
  // Limpar
  console.log('🧹 Limpando imagem de teste...');
  const { error: deleteError } = await supabase
    .storage
    .from('avatars')
    .remove([testImagePath]);
  
  if (!deleteError) {
    console.log('✅ Imagem de teste removida\n');
  }
  
  return true;
}

async function main() {
  console.log('🚀 Iniciando testes...\n');
  
  const test1 = await testStorageUpload();
  
  if (!test1) {
    console.log('\n❌ Teste básico falhou. Corrija o problema acima antes de continuar.\n');
    process.exit(1);
  }
  
  const test2 = await testImageUpload();
  
  if (!test2) {
    console.log('\n❌ Teste de imagem falhou.\n');
    process.exit(1);
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ TODOS OS TESTES PASSARAM!');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('💡 O Supabase Storage está configurado corretamente!');
  console.log('   Agora faça um novo upload no perfil da aplicação.\n');
  console.log('🔍 Se o upload na aplicação ainda cair no fallback local,');
  console.log('   o problema é com a autenticação do usuário.\n');
}

main().catch(error => {
  console.error('\n💥 Erro inesperado:', error.message);
  console.error(error);
  process.exit(1);
});
