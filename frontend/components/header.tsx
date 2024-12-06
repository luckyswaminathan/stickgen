import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          StickGen
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/upload">
                <Button variant="ghost">Upload</Button>
              </Link>
            </li>
            <li>
              <Link href="/gallery">
                <Button variant="ghost">Gallery</Button>
              </Link>
            </li>
            <li>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

