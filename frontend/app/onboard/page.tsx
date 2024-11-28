'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Initialize Supabase client
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY')

export default function OnboardPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      console.log('User signed up:', data)
      // TODO: Redirect to home page or show success message
    } catch (error) {
      console.error('Error signing up:', error)
      // TODO: Show error message to user
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      console.log('User signed in:', data)
      // TODO: Redirect to home page
    } catch (error) {
      console.error('Error signing in:', error)
      // TODO: Show error message to user
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Join StickGen</h1>
      <form className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex space-x-4">
          <Button onClick={handleSignUp} className="flex-1">
            Sign Up
          </Button>
          <Button onClick={handleSignIn} variant="outline" className="flex-1">
            Sign In
          </Button>
        </div>
      </form>
    </div>
  )
}

