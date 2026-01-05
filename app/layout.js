import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Chatbot Akademik ',
  description: 'Chatbot untuk informasi akademik kampus',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100`}>
        {children}
      </body>
    </html>
  )
}