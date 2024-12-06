'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

  useEffect(() => {
    const fetchPanel = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/gallery/${params.id}`)
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
  }, [params.id])

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (error || !panel) {
    return <div className="container mx-auto px-4 py-8">{error || 'Cartoon panel not found'}</div>
  }

  const handleDownload = () => {
    // Implement download functionality
    console.log('Downloading image:', panel.imageUrl)
  }

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing panel:', panel.id)
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

