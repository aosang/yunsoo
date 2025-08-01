'use client'
import './globals.css'
import 'antd/dist/reset.css'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
// 引入metadata
import { metadata } from '@/utils/metadata'
import { checkAuth } from '@/utils/authGuards'
import { ConfigProvider } from 'antd'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}
) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const verifyAuth = async () => {
    const authResult = await checkAuth()
    setIsAuthenticated(authResult)

    if (!authResult) {
      router.push('/')
    }
  }

  useEffect(() => {
    verifyAuth()
  }, [])


  return (
    <>
      <html lang="en">
        <head>
          <meta name="description" content={metadata.description || ''} />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <style>
          {`
            ::-webkit-scrollbar {
              width: 10px;
              height: 10px;
            }
            ::-webkit-scrollbar-track {
              background: #9eabbe;
              border-radius: 2px;
            }
            ::-webkit-scrollbar-thumb {
              background: #9eabbe;
              border-radius: 2px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: #9eabbe;
            }
          `}
        </style>
      </head>
      <body
        style={{ backgroundColor: '#f0f2f5' }}
        suppressHydrationWarning={true}
      >
        <ConfigProvider
          theme={{
            token: {
              fontFamily: 'siyuan, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              fontSize: 14,
            },
            components: {
              Card: {
                headerFontSize: 15,
                fontFamily: 'siyuan'
              },
              Modal: {
                titleFontSize: 15
              }
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
    </>
  )
}