import './globals.css'

export const metadata = {
  title: 'AI Chatbot - Vercel',
  description: 'Chatbot dengan Next.js 14',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}