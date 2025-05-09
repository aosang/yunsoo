'use client'
import SideBar from '../components/Sidebar'
import { getSession } from '@/utils/providerSelectData'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
          // setUserId(session!.user?.id)
          // let updateForm = {
          //   username: session.user.user_metadata.username || '',
          //   company: session.user.user_metadata.company || '',
          //   email: session.user.email || '',
          //   avatar_url: '',
          //   created_at: getTimeNumber()[0]
          // }
          // // let userRegister = window.localStorage.getItem('userRegister') || ''
          // updateProfiles(session!.user?.id, updateForm).then(() => {
          //   getProfiles()
          // })
          
          // window.localStorage.setItem('myId', session!.user.id)
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