import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// This would typically come from an API or database
const getCartoonPanel = (id: string) => {
  const panels = [
    { id: '1', title: 'Stick Figure Adventure', imageUrl: '/placeholder.svg?height=600&width=600', description: 'A thrilling adventure featuring our brave stick figure hero!' },
    { id: '2', title: 'Office Shenanigans', imageUrl: '/placeholder.svg?height=600&width=600', description: 'Hilarious moments from the daily life of stick figure office workers.' },
    { id: '3', title: 'Superhero Sticks', imageUrl: '/placeholder.svg?height=600&width=600', description: 'Stick figures with superpowers save the day in this action-packed panel!' },
  ]
  return panels.find(panel => panel.id === id)
}

export default function CartoonPanelPage({ params }: { params: { id: string } }) {
  const panel = getCartoonPanel(params.id)

  if (!panel) {
    return <div>Cartoon panel not found</div>
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
            <Button className="w-full">Download Image</Button>
            <Button variant="outline" className="w-full">Share</Button>
            <Link href="/gallery">
              <Button variant="ghost" className="w-full">Back to Gallery</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

