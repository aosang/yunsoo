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
  const [setPassword, changeSetPassword] = useState<boolean>(false)
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')

  const router = useRouter()

  const sendResetEmailInfo = async () => {
    if (!resetEmail) {
      useMessage(2, 'Please enter your email', 'error')
    } else {
      getProfiles()
      .then(async res => {
        let emailData = null
        emailData = res?.find(item => item.email === resetEmail) || null
        if (!emailData) {
          useMessage(2, 'Email not found', 'error')
        } else {
          const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: `${window.location.origin}/ResetPassword`
          })
          try {
            if (error !== null) return useMessage(2, 'The operation is too frequent, please try again later', 'error')
            useMessage(2, 'Email sent! Please check your email', 'success')
            setResetEmail('')
          } catch (error) {
            throw error
          }
        }
      })
    }
  }

  const changeMyPassword = async () => {
    if(newPassword!== confirmPassword) {
      useMessage(2, 'Passwords do not match', 'error')
    } else if (!newPassword || !confirmPassword) {
      useMessage(2, 'Please enter your new password!', 'error')
    } else if(!passwordRegFunc(newPassword)) {
      useMessage(2, 'Password must be 8-20 characters long and contain at least one uppercase letter, one lowercase letter, and one number', 'error')
    } else if (newPassword !== confirmPassword) {
      useMessage(2, 'Passwords do not match', 'error')
    } else {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      try {
        if(data.user) {
          useMessage(3, 'Password changed successfully!','success')
          supabase.auth.signOut()
          router.push('/')
        }else if(error) {
          useMessage(3, error.message,'error')
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

    if(code) {
      changeSetPassword(false)
    } else {
      changeSetPassword(true)
    }

    window.addEventListener('beforeunload', () => {
      supabase.auth.signOut()
    })

    document.title = 'Reset Password'
  }, [])

  return (
    <div style={resetBg}>
      {/* email */}
      {setPassword === true? (
        <div className="
          w-520 
          bg-white 
          absolute
          top-1/2
          left-1/2
          rounded-sm"
          style={resetBox}
        >
          <p className="font-semibold text-center text-2xl py-5">Reset Password</p>
          <i className="w-350 h-0.5 bg-slate-200 mx-auto mt-0 mb-5 "></i>
          {/* reset password reset */}
          <div className="w-350 mx-auto my-0">
            <div className='mb-4'>
              <label htmlFor="email" className='text-sm mb-1'>Email</label>
              <Input
                placeholder='Enter your email'
                allowClear
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <div
              className='text-xs cursor-pointer -mt-1 flex underline'
            >
              <div
                className='mt-0 mb-0 mr-0 ml-auto flex items-center'
                onClick={() => router.push('/')}
              >
                <span>Go to login</span>
                <RightOutlined />
              </div>
            </div>
            <Button
              type='primary'
              className='w-full h-10 mt-4 text-base mb-12 leading-10'
              onClick={sendResetEmailInfo}
            >
              Send Email
            </Button>
          </div>
        </div>
      ) : (
        // reset password

        <div className="
          w-520 
          bg-white 
          absolute
          top-1/2
          left-1/2
          rounded-sm"
          style={resetBox}
        >
          <p className="font-semibold text-center text-2xl py-5">Reset Password</p>
          <i className="w-350 h-0.5 bg-slate-200 mx-auto mt-0 mb-5 "></i>

          <div className="w-350 mx-auto my-0">
            <div className='mb-4'>
              <div className='flex items-center'>
                <label htmlFor="password" className='text-sm mb-1 mr-1'>New Password</label>
                <Tooltip placement='right' title='Password must be 8-20 characters long and contain at least one uppercase letter, one lowercase letter, and one number'>
                  <InfoCircleOutlined className='-mt-1 text-sm text-blue-700' />
                </Tooltip>
              </div>
              <Input.Password
                placeholder='Enter your new password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className='text-sm mb-1'>Confirm Password</label>
              <Input.Password
                placeholder='Confirm your password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div
              className='text-xs cursor-pointer flex underline'
            >
              <div
                className='mt-3 mb-0 mr-0 ml-auto flex items-center'
                onClick={() => router.push('/')}
              >
                <span>Go to login</span>
                <RightOutlined />
              </div>
            </div>
            <Button
              type='primary'
              className='w-full h-10 mt-5 text-base mb-12 leading-10'
              onClick={changeMyPassword}
            >
              Confirm
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
export default resetPassword