import { Dropdown, Space, Modal, Divider, Timeline } from 'antd'
import { DownOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { supabase } from '@/utils/clients'
import { useRouter } from 'next/navigation'
import type { MenuProps } from 'antd'
import Image from 'next/image'
import useMessage from '@/utils/message'
import { useState, useEffect } from 'react'
import { getProfiles, getSession } from '@/utils/providerSelectData'
import { getUpdateText } from '@/utils/pubFunProvider'
import { updateTextItem } from '@/utils/dbType'
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const [ username, setUsername ] = useState('')
  const [ avatarUrl, setAvatarUrl ] = useState('')
  const [updateText, setUpdateText] = useState<updateTextItem[]>([])
      

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

    getUpdateText().then(res => {
      setUpdateText(res)
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
            <Modal
              maskClosable={false}
              title="版本更新说明" 
              open={isModalOpen} 
              onCancel={() => setIsModalOpen(false)} 
              footer={false}
              width={700}
            >
              <Divider style={{margin: '10px 0'}} />
              <Timeline 
                style={{marginTop: '20px', paddingTop: '6px'}} 
                className='h-[560px] overflow-y-auto' items={updateText.map(item => ({
                  key: item.id,
                  children: <div>
                    <span className='text-[13px] text-gray-400 flex items-center'>{dayjs(item.created_at).format('YYYY-MM-DD')} <a className='ml-3'>{item.update_version}</a></span>
                    <span className='text-[15px] text-gray-600 leading-[22px]'>{item.update_content}</span>
                  </div>
                }))}
              >
              </Timeline>
            </Modal>
            <span className='mt-0 mb-0 -ml-3 mr-auto text-sm font-semibold text-blue-950'>
              <ClockCircleOutlined className='mr-1' /> {currentTime.format('YYYY-MM-DD HH:mm:ss')}
            </span>
            <span 
              className='mr-4 cursor-pointer' 
              onClick={() => setIsModalOpen(true)}
            >
              版本v1.0.0
            </span>
            {/* <LanguageSwitch /> */}
            <Image 
              src={avatarUrl? avatarUrl : 'https://www.wangle.run/company_icon/public_image/pub_avatar.jpg' } 
              width={32} 
              height={32} 
              alt='avatar'
              style={{
                borderRadius: '50%', 
                marginRight: '5px',
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