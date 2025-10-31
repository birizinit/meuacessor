"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, User as UserProfile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: {
    nome: string
    sobrenome: string
    cpf: string
    telefone: string
    nascimento: string
    api_token?: string
  }) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Limpar estado anterior ao inicializar
    setUser(null)
    setUserProfile(null)
    setSession(null)
    setLoading(true)

    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Sessão inicial encontrada:', session?.user?.id)
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Mudança de autenticação:', event, session?.user?.id)
      
      // Limpar estado quando não há sessão
      if (!session) {
        setUser(null)
        setUserProfile(null)
        setSession(null)
        setLoading(false)
        return
      }

      setSession(session)
      setUser(session.user)
      
      // Buscar perfil para o usuário atual
      if (session.user) {
        await fetchUserProfile(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Buscando perfil do usuário:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Erro ao buscar perfil do usuário:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        // Se o usuário não existe na tabela users, criar um perfil básico
        if (error.code === 'PGRST116') {
          console.log('👤 Usuário não encontrado na tabela users, criando perfil básico...')
          setUserProfile(null)
        }
      } else {
        console.log('✅ Perfil do usuário carregado com sucesso:', data)
        setUserProfile(data)
        
        // Carregar API token no localStorage se existir
        if (data.api_token) {
          console.log('🔑 API token encontrado no banco, carregando no localStorage')
          localStorage.setItem("apiToken", data.api_token)
        } else {
          console.log('❌ Nenhum API token encontrado no banco de dados')
        }
        
        // Carregar imagem de perfil no localStorage se existir
        if (data.profile_image) {
          console.log('🖼️ Imagem de perfil encontrada no banco, carregando no localStorage')
          
          // Corrigir URL antiga se necessário - remover /api/ do caminho
          let imageUrl = data.profile_image
          if (imageUrl.startsWith('/api/uploads/')) {
            imageUrl = imageUrl.replace('/api/uploads/', '/uploads/')
            console.log('🔄 URL corrigida no AuthContext:', imageUrl)
          }
          
          localStorage.setItem("profileImage", imageUrl)
          
          // Disparar evento para atualizar o header
          window.dispatchEvent(new CustomEvent("profileImageChange", { detail: imageUrl }))
        } else {
          console.log('❌ Nenhuma imagem de perfil encontrada no banco de dados')
          // Limpar localStorage se não há imagem no banco
          localStorage.removeItem("profileImage")
        }
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar perfil do usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, userData: {
    nome: string
    sobrenome: string
    cpf: string
    telefone: string
    nascimento: string
    api_token?: string
  }) => {
    console.log('🔐 Dados do cadastro:', { email, userData })
    
    // Fazer logout completo antes do cadastro para evitar interferência de sessão
    console.log('🚪 Fazendo logout antes do cadastro para evitar interferência de sessão')
    await supabase.auth.signOut()
    
    // Limpar estado antes do cadastro
    setUser(null)
    setUserProfile(null)
    setSession(null)
    setLoading(true)
    
    // Aguardar um pouco para garantir que o logout foi processado
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })

    console.log('🔐 Resultado do signUp:', { data, error })

    if (!error && data.user) {
      console.log('🔐 Criando perfil do usuário com dados:', {
        id: data.user.id,
        email: data.user.email,
        api_token: userData.api_token
      })
      
      // Aguardar um pouco para garantir que a sessão foi estabelecida
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Criar perfil do usuário na tabela users
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          nome: userData.nome,
          sobrenome: userData.sobrenome,
          cpf: userData.cpf,
          telefone: userData.telefone,
          nascimento: userData.nascimento,
          api_token: userData.api_token || null,
        })

      if (profileError) {
        console.error('❌ Erro ao criar perfil do usuário:', profileError)
        setLoading(false)
        return { error: profileError }
      } else {
        console.log('✅ Perfil do usuário criado com sucesso!')
        setLoading(false)
      }
    } else {
      setLoading(false)
    }

    return { error }
  }

  const signOut = async () => {
    console.log('🚪 Fazendo logout do usuário')
    
    // Limpar localStorage
    localStorage.removeItem("apiToken")
    localStorage.removeItem("profileImage")
    
    // Limpar estado local primeiro
    setUser(null)
    setUserProfile(null)
    setSession(null)
    setLoading(false)
    
    // Fazer logout no Supabase
    await supabase.auth.signOut()
    
    // Aguardar um pouco para garantir que o logout foi processado
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('✅ Logout realizado com sucesso')
  }

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Usuário não autenticado') }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      setUserProfile(prev => prev ? { ...prev, ...updates } : null)
    }

    return { error }
  }

  const value = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}