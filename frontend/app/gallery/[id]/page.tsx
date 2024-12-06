'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface CartoonPanel {
  id: string
  title: string
  imageUrl: string
  description: string
}

export default function CartoonPanelPage({ params }: { params: { id: string } }) {
  const [panel, setPanel] = useState<CartoonPanel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchPanel = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }

        const userId = session.user.id
        console.log(`Fetching panel for user_id: ${userId} and panel_id: ${params.id}`)
        const response = await fetch(`http://127.0.0.1:8000/gallery/${userId}/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch panel')
        }

        const data = await response.json()
        setPanel(data)
      } catch (err) {
        setError('Error fetching cartoon panel. Please try again later.')
        console.error('Error fetching panel:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPanel()
  }, [params.id, router, supabase])

  const handleDownload = async () => {
    if (!panel) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/download/${session.user.id}/${panel.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to download image')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${panel.title}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading image:', err)
      alert('Failed to download image. Please try again later.')
    }
  }

  const handleShare = async () => {
    if (!panel) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const shareUrl = `${window.location.origin}/gallery/${session.user.id}/${panel.id}`
      await navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    } catch (err) {
      console.error('Error sharing panel:', err)
      alert('Failed to share panel. Please try again later.')
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (error || !panel) {
    return <div className="container mx-auto px-4 py-8">{error || 'Cartoon panel not found'}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{panel.title}</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Image
            src={panel.imageUrl}
            alt={panel.title}
            width={600}
            height={600}
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
        <div>
          <p className="text-lg mb-4">{panel.description}</p>
          <div className="space-y-4">
            <Button className="w-full" onClick={handleDownload}>Download Image</Button>
            <Button variant="outline" className="w-full" onClick={handleShare}>Share</Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push('/gallery')}>
              Back to Gallery
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

