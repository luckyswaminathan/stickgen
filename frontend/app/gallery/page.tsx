import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// This would typically come from an API or database
const cartoonPanels = [
  { id: 1, title: 'Stick Figure Adventure', imageUrl: '/placeholder.svg?height=300&width=300' },
  { id: 2, title: 'Office Shenanigans', imageUrl: '/placeholder.svg?height=300&width=300' },
  { id: 3, title: 'Superhero Sticks', imageUrl: '/placeholder.svg?height=300&width=300' },
  { id: 4, title: 'Stick Sports', imageUrl: '/placeholder.svg?height=300&width=300' },
  { id: 5, title: 'Stick Family Vacation', imageUrl: '/placeholder.svg?height=300&width=300' },
  { id: 6, title: 'Stick School Days', imageUrl: '/placeholder.svg?height=300&width=300' },
]

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">StickGen Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cartoonPanels.map((panel) => (
          <div key={panel.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <Image
              src={panel.imageUrl}
              alt={panel.title}
              width={300}
              height={300}
              className="w-full h-auto"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{panel.title}</h2>
              <Link href={`/gallery/${panel.id}`}>
                <Button variant="outline" className="w-full">View Details</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/upload">
          <Button>Create Your Own</Button>
        </Link>
      </div>
    </div>
  )
}

