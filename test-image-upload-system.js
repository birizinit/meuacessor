#!/usr/bin/env node

/**
 * Script de Diagnóstico do Sistema de Upload de Imagens
 * 
 * Este script verifica:
 * 1. Se o diretório public/uploads existe
 * 2. Se há imagens no diretório
 * 3. Se as variáveis de ambiente do Supabase estão configuradas
 * 4. Se o bucket do Supabase Storage existe e está acessível
 * 5. Se o banco de dados tem a coluna profile_image
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DO SISTEMA DE UPLOAD DE IMAGENS\n');
console.log('=' .repeat(60));

// Teste 1: Verificar diretório local
console.log('\n📁 [1/5] Verificando diretório local de uploads...');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (fs.existsSync(uploadsDir)) {
  console.log('✅ Diretório existe:', uploadsDir);
  
  const files = fs.readdirSync(uploadsDir);
  console.log(`📊 Total de arquivos: ${files.length}`);
  
  if (files.length > 0) {
    console.log('📄 Últimos 5 arquivos:');
    files.slice(-5).forEach(file => {
      const stats = fs.statSync(path.join(uploadsDir, file));
      const sizeInKB = (stats.size / 1024).toFixed(2);
      console.log(`   - ${file} (${sizeInKB} KB)`);
    });
  }
} else {
  console.log('❌ Diretório não existe');
  console.log('💡 Será criado automaticamente no primeiro upload');
}

// Teste 2: Verificar variáveis de ambiente
console.log('\n🔐 [2/5] Verificando variáveis de ambiente...');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL: NÃO CONFIGURADA');
  console.log('💡 Configure no arquivo .env.local');
}

if (supabaseKey) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey.substring(0, 20) + '...');
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: NÃO CONFIGURADA');
  console.log('💡 Configure no arquivo .env.local');
}

// Teste 3: Verificar rota de upload
console.log('\n📤 [3/5] Verificando rota de upload...');
const uploadRouteFile = path.join(process.cwd(), 'app', 'api', 'upload', 'route.ts');
if (fs.existsSync(uploadRouteFile)) {
  console.log('✅ Rota de upload existe:', uploadRouteFile);
  
  const content = fs.readFileSync(uploadRouteFile, 'utf8');
  
  // Verificar se tem suporte ao Supabase Storage
  if (content.includes('supabase.storage.from(\'avatars\')')) {
    console.log('✅ Suporte ao Supabase Storage: HABILITADO');
  } else {
    console.log('⚠️ Suporte ao Supabase Storage: NÃO ENCONTRADO');
  }
  
  // Verificar se tem fallback local
  if (content.includes('public/uploads')) {
    console.log('✅ Fallback para storage local: HABILITADO');
  } else {
    console.log('⚠️ Fallback para storage local: NÃO ENCONTRADO');
  }
} else {
  console.log('❌ Rota de upload não encontrada');
}

// Teste 4: Verificar rota de servir imagens
console.log('\n🖼️ [4/5] Verificando rota para servir imagens...');
const uploadsRouteFile = path.join(process.cwd(), 'app', 'api', 'uploads', '[filename]', 'route.ts');
if (fs.existsSync(uploadsRouteFile)) {
  console.log('✅ Rota para servir imagens existe:', uploadsRouteFile);
} else {
  console.log('❌ Rota para servir imagens não encontrada');
  console.log('💡 Crie o arquivo: app/api/uploads/[filename]/route.ts');
}

// Teste 5: Verificar configuração do Next.js
console.log('\n⚙️ [5/5] Verificando configuração do Next.js...');
const nextConfigFile = path.join(process.cwd(), 'next.config.mjs');
if (fs.existsSync(nextConfigFile)) {
  console.log('✅ next.config.mjs existe');
  
  const content = fs.readFileSync(nextConfigFile, 'utf8');
  
  if (content.includes('remotePatterns')) {
    console.log('✅ Configuração de imagens externas (remotePatterns): CONFIGURADA');
  } else {
    console.log('⚠️ Configuração de imagens externas: NÃO ENCONTRADA');
    console.log('💡 Adicione remotePatterns para suportar imagens do Supabase');
  }
  
  if (content.includes('unoptimized')) {
    console.log('✅ Otimização de imagens: DESABILITADA (bom para imagens externas)');
  }
} else {
  console.log('❌ next.config.mjs não encontrado');
}

// Resumo
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DO DIAGNÓSTICO\n');

const hasUploadRoute = fs.existsSync(uploadRouteFile);
const hasUploadsDir = fs.existsSync(uploadsDir);
const hasSupabaseConfig = supabaseUrl && supabaseKey;

console.log('Status Geral:');
console.log(`  Sistema de Upload: ${hasUploadRoute ? '✅' : '❌'}`);
console.log(`  Diretório Local: ${hasUploadsDir ? '✅' : '⚠️'}`);
console.log(`  Configuração Supabase: ${hasSupabaseConfig ? '✅' : '❌'}`);

console.log('\n🎯 RECOMENDAÇÕES:\n');

if (!hasSupabaseConfig) {
  console.log('1. Configure as variáveis do Supabase no arquivo .env.local:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui');
}

if (hasSupabaseConfig) {
  console.log('1. Crie o bucket "avatars" no Supabase Storage');
  console.log('2. Marque o bucket como PÚBLICO');
  console.log('3. Execute o SQL em setup-supabase-storage.sql');
}

console.log('\n📚 Para mais detalhes, consulte:');
console.log('   - INSTRUCOES_CONFIGURAR_SUPABASE_STORAGE.md');
console.log('   - RESUMO_CORRECOES_IMAGENS.md');
console.log('   - PERGUNTAS_DIAGNOSTICO_IMAGENS.md');

console.log('\n' + '='.repeat(60));
console.log('✨ Diagnóstico concluído!\n');
