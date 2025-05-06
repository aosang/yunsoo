'use client'

import useMessage from '@/utils/message'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Button, Tooltip } from 'antd'
import { supabase } from '@/utils/clients'
import { getProfiles } from '@/utils/providerSelectData'
import { RightOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { passwordRegFunc } from '@/utils/pubFunProvider'

const resetBg: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100vh',
  background: '#2644a6'
}

const resetBox: React.CSSProperties = {
  transform: 'translate(-50%, -50%)',
}

const resetPassword = () => {
  const [resetEmail, setResetEmail] = useState<string>('')
  const [setPassword, changeSetPassword] = useState<boolean>(true)
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const router = useRouter()

  const sendResetEmailInfo = async () => {
    if (!resetEmail) {
      useMessage(2, '请输入邮箱', 'error')
    } else {
      getProfiles()
        .then(async res => {
          let emailData = null
          emailData = res?.find(item => item.email === resetEmail) || null
          if (!emailData) {
            useMessage(2, '邮箱未找到', 'error')
          } else {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
              redirectTo: `${window.location.origin}/ResetPassword`
            })
            try {
              if (error !== null) return useMessage(2, '操作过于频繁，请稍后再试', 'error')
              useMessage(2, '邮箱发送成功，请检查邮箱', 'success')
              setResetEmail('')
            } catch (error) {
              throw error
            }
          }
        })
    }
  }

  const changeMyPassword = async () => {
    if (newPassword !== confirmPassword) {
      useMessage(2, '密码不匹配', 'error')
    } else if (!newPassword || !confirmPassword) {
      useMessage(2, '请输入新密码', 'error')
    } else if (!passwordRegFunc(newPassword)) {
      useMessage(2, '密码必须包含8-20个字符，至少包含一个大写字母、一个小写字母和一个数字', 'error')
    } else if (newPassword !== confirmPassword) {
      useMessage(2, '两次密码输入不一致', 'error')
    } else {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      try {
        if (data.user) {
          useMessage(3, '密码修改成功', 'success')
          supabase.auth.signOut()
          router.push('/')
        } else if (error) {
          useMessage(3, error.message, 'error')
          supabase.auth.signOut()
        }
      }
      catch (error) {
        throw error
      }
    }
  }

  useEffect(() => {
    const url = window.location.href
    const parsedUrl = new URL(url)
    let code: string | null = ''
    code = parsedUrl.searchParams.get("code")

    if (code) {
      changeSetPassword(false)
    } else {
      changeSetPassword(true)
    }
    
    setIsLoading(false)

    window.addEventListener('beforeunload', () => {
      supabase.auth.signOut()
    })

    document.title = '重置密码'
  }, [])

  if (isLoading) {
    return (
      <div style={resetBg} className="flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    )
  }

  return (
    <div style={resetBg}>
      {setPassword ? (
        <div className="
          w-520 
          bg-white 
          absolute
          top-1/2
          left-1/2
          rounded-sm"
        style={resetBox}
        >
          {/* 邮箱重置部分 */}
          <p className="font-semibold text-center text-2xl py-5">重置密码</p>
          <i className="w-350 h-0.5 bg-slate-200 mx-auto mt-0 mb-5 "></i>
          {/* reset password reset */}
          <div className="w-350 mx-auto my-0">
            <div className='mb-4'>
              <label htmlFor="email" className='text-sm mb-1 ml-1'>电子邮箱</label>
              <Input
                placeholder='请输入邮箱'
                allowClear
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className='h-9'
              />
            </div>
            <div
              className='text-xs cursor-pointer -mt-1 flex underline'
            >
              <div
                className='mt-0 mb-0 mr-0 ml-auto flex items-center'
                onClick={() => router.push('/')}
              >
                <span>返回登录</span>
                <RightOutlined />
              </div>
            </div>
            <Button
              type='primary'
              className='w-full h-10 mt-4 text-base mb-12 leading-10'
              onClick={sendResetEmailInfo}
            >
              发送邮件
            </Button>
          </div>
        </div>
      ) : (
        <div className="
          w-520 
          bg-white 
          absolute
          top-1/2
          left-1/2
          rounded-sm"
        style={resetBox}
        >
          {/* 密码重置部分 */}
          <p className="font-semibold text-center text-2xl py-5">重置密码</p>
          <i className="w-350 h-0.5 bg-slate-200 mx-auto mt-0 mb-5 "></i>

          <div className="w-350 mx-auto my-0">
            <div className='mb-4'>
              <div className='flex items-center'>
                <label htmlFor="password" className='text-sm mb-1 mr-1 ml-1'>新密码</label>
                <Tooltip placement='right' title='密码必须包含8-20个字符，至少包含一个大写字母、一个小写字母和一个数字'>
                  <InfoCircleOutlined className='-mt-1 text-sm text-blue-700' />
                </Tooltip>
              </div>
              <Input.Password
                placeholder='请输入新密码'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className='h-9'
              />
            </div>
            <div>
              <label htmlFor="password" className='text-sm mb-1 ml-1'>确认密码</label>
              <Input.Password
                placeholder='请确认密码'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='h-9'
              />
            </div>
            <div
              className='text-xs cursor-pointer flex underline'
            >
              <div
                className='mt-3 mb-0 mr-0 ml-auto flex items-center'
                onClick={() => router.push('/')}
              >
                <span>返回登录</span>
                <RightOutlined />
              </div>
            </div>
            <Button
              type='primary'
              className='w-full h-10 mt-5 text-base mb-12 leading-10'
              onClick={changeMyPassword}
            >
              确认密码
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
export default resetPassword