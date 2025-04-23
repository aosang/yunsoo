'use client'
import './globals.css'
import 'antd/dist/reset.css'
import Providers from './Provider'
import { useEffect } from 'react'

// export const metadata = {
//   description: 'yunsoo资产管理系统',
// }

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}
) {
  useEffect(() => {
    
  }, []);

  return (
    <html lang="en">
      <head>
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}