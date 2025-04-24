'use client'
import SideBar from '../components/Sidebar'
import { getSession, updateProfiles } from '@/utils/providerSelectData'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getProfiles } from '@/utils/providerSelectData'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mySession, setMySession] = useState<any>('')
  const [userId, setUserId] = useState<string>('')

  const getCheckSession = () => {
    getSession()
      .then(res => {
        const { session } = res!
        setMySession(session)
        
        if (!session) {
          router.replace('/')
        } else {
          setUserId(session!.user?.id)
          let userRegister = window.localStorage.getItem('userRegister') || ''
          if (userRegister) {
            updateProfiles(session!.user?.id, JSON.parse(userRegister))
          }else {
            getProfiles(session!.user?.id)
              .then(res => {
                if (res) {
                  window.localStorage.setItem('userRegister', JSON.stringify(res))
                }
              })
          }
          
          window.localStorage.setItem('myId', session!.user.id)
        }
      })
  }

  useEffect(() => {
    getCheckSession()
  }, [])

  return (
    <>
      {mySession && (
        <div>
          <SideBar userId={userId} update={mySession}>
            {children}
          </SideBar>
        </div>
      )}
    </>
  )
}