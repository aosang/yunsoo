import { Dropdown, Space } from 'antd'
import { DownOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { supabase } from '@/utils/clients'
import { useRouter } from 'next/navigation'
import type { MenuProps } from 'antd'
import Image from 'next/image'
import useMessage from '@/utils/message'
import { useState, useEffect } from 'react'
import { getProfiles, getSession } from '@/utils/providerSelectData'
import dayjs from 'dayjs'


const items: MenuProps['items'] = [{
  key: '1',
  label: '退出登录',
}]

const profile: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'end',
  alignItems: 'center'
}

const DropDownMenu = () => {
  const [currentTime, setCurrentTime] = useState(dayjs())
  const router = useRouter()
  const [ username, setUsername ] = useState('')
  const [ avatarUrl, setAvatarUrl ] = useState('')
  
  const handleMenuClick: MenuProps['onClick'] = async ({ key }) => { 
    if(key === '1') {
      const { error } = await supabase.auth.signOut()
      if(error) throw new Error(error.message)
      router.push('/')
      useMessage(2, '已退出!','success')
    }
  }

  const getMyInfomation = () => {
    getSession().then(res => {
      setUsername(res!.session?.user.user_metadata.username)

      getProfiles(res!.session?.user.id).then(res => {
        setAvatarUrl(res![0].avatar_url)
      })
    })

    
  }

  useEffect(() => {
    getMyInfomation()

    const timerId = setInterval(() => {
      setCurrentTime(dayjs())
    }, 1000)

    return () => clearInterval(timerId)
  }, [])

  return (
    <>
      <div style={profile}>
        {username && (
          <>
            <span className='mt-0 mb-0 -ml-3 mr-auto text-sm font-semibold text-blue-950'>
              <ClockCircleOutlined className='mr-1' /> {currentTime.format('YYYY-MM-DD HH:mm:ss')}
            </span>
            {/* <LanguageSwitch /> */}
            <Image 
              src={avatarUrl? avatarUrl : 'https://www.wangle.run/company_icon/public_image/pub_avatar.jpg' } 
              width={32} 
              height={32} 
              alt='avatar'
              style={{
                borderRadius: '50%', 
                marginRight: '10px',
                width: '32px',
                height: '32px'
              }}  
            />
            <Dropdown menu={{
              items,
              onClick: handleMenuClick
            }}>
              <a>
                <Space>
                  {username}
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </>
        )}
      </div>
    </>
  )
}

export default DropDownMenu;