import './globals.css'

export const metadata = {
  title: 'AI Chatbot Akademik',
  description: 'Chatbot cerdas untuk informasi kampus',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}