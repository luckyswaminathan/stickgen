'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export function Header() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          StickGen
        </Link>
        <nav>
          <ul className="flex space-x-4">
            {user ? (
              <>
                <li>
                  <Link href={`/upload/${user.id}`}>
                    <Button variant="ghost">Upload</Button>
                  </Link>
                </li>
                <li>
                  <Link href={`/gallery/${user.id}`}>
                    <Button variant="ghost">Gallery</Button>
                  </Link>
                </li>
                <li>
                  <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login">
                    <Button variant="ghost">Upload</Button>
                  </Link>
                </li>
                <li>
                  <Link href="/login">
                    <Button variant="ghost">Gallery</Button>
                  </Link>
                </li>
                <li>
                  <Link href="/login">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}

