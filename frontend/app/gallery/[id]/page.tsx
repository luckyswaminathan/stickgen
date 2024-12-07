'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Download, Share, X } from 'lucide-react'

interface Animation {
  user_id: string
  animation_id: string
  filename: string
  content_type: string
  image_data: string
  created_at: string
}

interface GalleryResponse {
  status: string
  animations: Animation[]
}

export default function GalleryPage() {
  const [animations, setAnimations] = useState<Animation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedAnimation, setSelectedAnimation] = useState<Animation | null>(null)
  const itemsPerPage = 9
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAnimations()
  }, [currentPage])

  const fetchAnimations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const userId = session.user.id
      const response = await fetch(`http://127.0.0.1:8000/gallery/${userId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch animations')
      }

      const data: GalleryResponse = await response.json()
      
      // Implement client-side pagination
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedAnimations = data.animations.slice(startIndex, endIndex)
      
      setHasMore(endIndex < data.animations.length)
      setAnimations(paginatedAnimations)
    } catch (err) {
      setError('Error fetching animations. Please try again later.')
      console.error('Error fetching animations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (animation: Animation) => {
    setSelectedAnimation(animation)
  }

  const handleDownload = async (animation: Animation) => {
    try {
      const byteCharacters = atob(animation.image_data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: animation.content_type })
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = animation.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading image:', err)
      alert('Failed to download image. Please try again later.')
    }
  }

  const handleShare = async (animation: Animation) => {
    try {
      const shareUrl = `${window.location.origin}/gallery/${animation.user_id}/${animation.animation_id}`
      await navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    } catch (err) {
      console.error('Error sharing:', err)
      alert('Failed to share. Please try again later.')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-lg">Loading animations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Animations</h1>
        <Button 
          onClick={async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user?.id) {
              router.push(`/upload/${session.user.id}`)
            } else {
              router.push('/login')
            }
          }}
        >
          Upload New
        </Button>
      </div>

      {animations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No animations found. Start by uploading one!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animations.map((animation) => (
              <div 
                key={animation.animation_id} 
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative">
                  <img
                    src={`data:${animation.content_type};base64,${animation.image_data}`}
                    alt={animation.filename}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-2 truncate">{animation.filename}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {new Date(animation.created_at).toLocaleDateString()}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleViewDetails(animation)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 font-medium">
              Page {currentPage}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!hasMore}
            >
              Next
            </Button>
          </div>
        </>
      )}

      <Dialog open={selectedAnimation !== null} onOpenChange={() => setSelectedAnimation(null)}>
        <DialogContent className="max-w-3xl w-full data-[state=open]:animate-contentCollapse">
          <DialogHeader className="animate-fadeIn">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-semibold">
                {selectedAnimation?.filename}
              </DialogTitle>
              <Button
                variant="default"
                onClick={() => setSelectedAnimation(null)}
                className="transition-all duration-300 hover:opacity-70 hover:rotate-90"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedAnimation && (
            <>
              <div className="aspect-square relative overflow-hidden rounded-lg animate-slideUp">
                <img
                  src={`data:${selectedAnimation.content_type};base64,${selectedAnimation.image_data}`}
                  alt={selectedAnimation.filename}
                  className="w-full h-full object-contain transition-all duration-300 hover:scale-105 hover:rotate-1"
                />
              </div>

              <div className="mt-4 animate-fadeIn [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
                <p className="text-sm text-gray-500">
                  Created: {new Date(selectedAnimation.created_at).toLocaleString()}
                </p>
              </div>

              <DialogFooter className="flex justify-end gap-2 animate-fadeIn [animation-delay:300ms] opacity-0 [animation-fill-mode:forwards]">
                <Button
                  variant="outline"
                  onClick={() => handleShare(selectedAnimation)}
                  className="transition-all duration-300 hover:bg-black hover:text-white"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={() => handleDownload(selectedAnimation)}
                  className="transition-all duration-300 bg-gray-100 hover:bg-black hover:text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

