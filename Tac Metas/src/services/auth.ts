import { supabase } from '../lib/supabaseClient'
import type { Role, UserProfile } from '../app/types'
import { cleanUsername, usernameToEmail } from '../utils/username'

export interface AuthError {
  message: string
}

export const authService = {
  async signUp(data: { name: string; username: string; password: string; role: Role }) {
    const email = usernameToEmail(data.username)
    
    // DEBUG: mostrar email e códigos dos caracteres
    console.log("EMAIL RAW =>", email);
    console.log("EMAIL LEN =>", email.length);
    console.log("EMAIL CHARS =>", Array.from(email).map(c => c.charCodeAt(0)));

    // 1. Auth SignUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email, // NÃO colocar JSON.stringify(email) aqui
      password: data.password,
      options: {
        emailRedirectTo: undefined,
      },
    })

    console.log("SUPABASE SIGNUP ERROR =>", authError);

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new Error('Usuário já existe')
      }
      throw new Error(authError.message)
    }
    
    if (!authData.user) throw new Error('Usuário não criado')

    // 2. Get Cargo ID
    const { data: cargoData, error: cargoError } = await supabase
      .from('cargos')
      .select('id')
      .eq('name', data.role)
      .single()

    if (cargoError || !cargoData) {
      throw new Error('Cargo inválido ou não encontrado')
    }

    // 3. Create Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: data.name,
        username: cleanUsername(data.username),
        cargo_id: cargoData.id
      })

    if (profileError) {
      // If profile creation fails, we should ideally cleanup the auth user, but for now just throw
      throw new Error(profileError.message)
    }

    return { user: authData.user, role: data.role }
  },

  async signIn(data: { username: string; password: string }) {
    const email = usernameToEmail(data.username)
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: data.password,
    })

    if (authError) throw new Error('Usuário ou senha inválidos')
    
    return this.getMe()
  },

  async signOut() {
    await supabase.auth.signOut()
  },

  async getMe(): Promise<UserProfile | null> {
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session?.user) return null

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        username,
        cargos (
          name
        )
      `)
      .eq('id', sessionData.session.user.id)
      .single()

    if (error || !profileData) return null

    // Cast the joined cargo name back to Role type
    // We assume the DB has valid role names matches existing types
    const roleName = Array.isArray(profileData.cargos) 
      ? profileData.cargos[0]?.name 
      : (profileData.cargos as any)?.name

    return {
      id: profileData.id,
      name: profileData.name,
      role: roleName as Role
    }
  }
}
