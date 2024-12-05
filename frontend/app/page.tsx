'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { WalkingStickFigure } from '../components/walking-stick-figure'
import { useAuth } from '../hooks/useAuth'
import { signOut } from '../lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Home() {
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoading(false)
    }
    checkUser()
  }, [supabase.auth])

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut()
    router.refresh()
    setIsLoading(false)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] relative">
      <h1 className="text-4xl font-bold mb-6 z-10">Welcome to StickGen</h1>
      <p className="text-xl mb-8 text-center max-w-2xl z-10">
        Transform your stick figure drawings into hilarious cartoon panels with just a few clicks!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-10">
        <Link href="/upload">
          <Button className="w-full h-16 text-lg">Upload Stick Figure</Button>
        </Link>
        <Link href="/gallery">
          <Button variant="outline" className="w-full h-16 text-lg">View Gallery</Button>
        </Link>
      </div>
  
      <div className="walking-container">
        <WalkingStickFigure />
      </div>
    </div>
  )
}

