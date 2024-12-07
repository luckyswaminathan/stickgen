'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WalkingStickFigure } from '@/components/walking-stick-figure'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const StandingStickFigure = () => {
  return (
    <div className="flex justify-center h-[100px] mb-8 overflow-hidden">
      <div className="relative w-[40px] h-[80px]">
        {/* Head */}
        <div className="absolute top-0 left-[10px] w-[20px] h-[20px] rounded-full bg-black"/>
        
        {/* Body */}
        <div className="absolute top-[20px] left-[19px] w-[2px] h-[30px] bg-black"/>
        
        {/* Arms */}
        <div className="absolute top-[22px] left-[19px] w-[2px] h-[20px] bg-black origin-top animate-leftArmSwing"/>
        <div className="absolute top-[22px] right-[19px] w-[2px] h-[20px] bg-black origin-top animate-rightArmSwing"/>
        
        {/* Legs */}
        <div className="absolute top-[50px] left-[19px] w-[2px] h-[30px] bg-black origin-top animate-leftLegSwing"/>
        <div className="absolute top-[50px] right-[19px] w-[2px] h-[30px] bg-black origin-top animate-rightLegSwing"/>
      </div>
    </div>
  )
}

const UploadIcon = () => (
  <svg 
    className="w-12 h-12 mx-auto mb-2 text-gray-400" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path 
      d="M12 4v12m0-12l-4 4m4-4l4 4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
)

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
    }
    checkUser()
  }, [supabase, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !user) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('user_id', user.id)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const userId = session.user.id
      console.log(userId)
      console.log('uploading for userid: ' + userId)

      const response = await fetch(`http://127.0.0.1:8000/upload/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const data = await response.json()
      console.log('Upload successful:', data)
      
      // Clear the form after successful upload
      setFile(null)
      setPreview(null)
      
      // Optional: Show success message or redirect to gallery
      // router.push('/gallery')
      
    } catch (error) {
      console.error('Upload failed:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <main className="min-h-screen bg-yc-bg p-8">
      {/* Navigation */}
      <nav className="mb-8">
        <Link href="/" className="transition-colors">
          ← Back to Home
        </Link>
      </nav>

      <StandingStickFigure />

      {/* Upload Form */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Upload Your Animation</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={loading}
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer text-black hover:text-orange-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 mx-auto"
                />
              ) : (
                <div className="space-y-2">
                  <UploadIcon />
                  <span className="block text-sm font-medium text-gray-900">
                    Click to upload a file
                  </span>
                </div>
              )}
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className={`w-full py-2 px-4 rounded-md text-white transition-colors
              ${!file || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-yc-orange hover:bg-orange-700'
              }`}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      <WalkingStickFigure />
    </main>
  )
}

