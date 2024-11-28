import './globals.css'
import './styles/walking-stick-figure.css'
import { Inter } from 'next/font/google'
import { Header } from '../components/header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'StickGen',
  description: 'Turn stick figures into cartoon panels',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black`}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}

