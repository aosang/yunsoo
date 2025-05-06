'use client'
import './globals.css'
import 'antd/dist/reset.css'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { checkAuth } from '@/utils/authGuards'
import Transation from '@components/Transation'
// 引入metadata
import { metadata } from '@/utils/metadata'

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

  useEffect(() => {
    const verifyAuth = async () => {
      const authResult = await checkAuth()
      setIsAuthenticated(authResult)
      setIsLoading(false)
      
      // 如果未登录且不在登录页面，重定向到登录页
      if (!authResult && pathname !== '/' && pathname !== '/ResetPassword/') {
        router.push('/')
      }else if (pathname === '/ResetPassword/') {
        router.push('/ResetPassword')
      }
      // 如果已登录且在登录页面，重定向到首页或仪表盘
      else if (authResult && pathname === '/') {
        router.push('/Home') // 或其他适合的已认证用户的首页
      }
    }

    verifyAuth()
  }, [pathname, router])

  return (
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
        {isLoading ? <Transation /> : children}
      </body>
    </html>
  )
}