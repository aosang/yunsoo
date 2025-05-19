'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Button, Tooltip } from 'antd'
import { emailRegFunc, passwordRegFunc } from '@/utils/pubFunProvider'
import Transation from '@components/Transation'
import { supabase } from '@/utils/clients'
import { formCollect } from '@/utils/dbType'
import { InfoCircleOutlined } from '@ant-design/icons'
import authScss from './auth.module.scss'
import useMessage from '@/utils/message'
import Verify from './components/Verify'

const Auth: React.FC = () => {
  const router = useRouter()
  const [isSpining, setIsSpining] = useState<boolean>(true)
  const [mySession, setMySession] = useState<any>('')
  const [isVerify, setIsVerify] = useState<boolean>(false)
  const [formVisiable, setFormVisiable] = useState(false)
  const [formState, setFormState] = useState<formCollect>({
    email: '',
    password: '',
    company: '',
    username: '',
  })

  const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (session) {
      setMySession(session)
      router.push('/Home')
    }
  }

  // 回车登录
  const onPressEnterSigin = (e: any) => {
    if (!formVisiable) {
      if (e.key === 'Enter') validateSignUpForm(2)
    } else {
      if (e.key === 'Enter') validateSignUpForm(1)
    }
  }

  // 注册提交表单
  const validateSignUpForm = async (type: number) => {
    const { email, password, company, username } = formState
    if (type === 1) {
      if (!emailRegFunc(email)) {
        useMessage(2, '请输入邮箱', 'error')
      } else if (!passwordRegFunc(password)) {
        useMessage(2, '请输入正确的密码', 'error')
      } else if (!company) {
        useMessage(2, '请输入公司名称', 'error')
      } else if (!username) {
        useMessage(2, '请输入用户名', 'error')
      } else {
        const { data, error } = await supabase.from('profiles').select('username, email')
        if (data![0]?.username && username === data![0]?.username) {
          useMessage(2, '用户名已存在', 'error')
        } else if (data![0]?.email && email === data![0]?.email) {
          useMessage(2, '邮箱已存在', 'error')
        } else {
          useMessage(2, '注册成功', 'success')
          setIsVerify(true)

          const { error } = await supabase.auth.signUp({
            email,
            password,
            
            options: {
              data: {
                username, 
                company
              },
              emailRedirectTo: 'https://www.wangle.run/assetsmanager/Home'
              // emailRedirectTo: 'http://localhost:3000/Home'
            }
          })
          if (error) return useMessage(2, error.message, 'error')
        }
      }
    } else {
      if (!emailRegFunc(email)) {
        useMessage(2, '请输入正确的邮箱', 'error')
      } else if (!passwordRegFunc(password)) {
        useMessage(2, '请输入正确的密码', 'error')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        try {
          if (data.session) {
            useMessage(2, '登录成功', 'success')
            router.push('/Home')
          } else if (error) {
            if (error.message === 'Invalid login credentials')
              useMessage(2, '邮箱或密码错误', 'error')
          }
        } catch (error) {
          throw error
        }
      }
    }
  }

  // 邮箱
  const changeEmailValue = (e: any) => {
    setFormState({ ...formState, email: e.target.value })
  }

  // 密码
  const changePasswordValue = (e: any) => {
    setFormState({ ...formState, password: e.target.value })
  }

  // 用户名
  const changeUsernameValue = (e: any) => {
    setFormState({ ...formState, username: e.target.value })
  }

  const changeCompanyValue = (e: any) => {
    setFormState({ ...formState, company: e.target.value })
  }

  const changeFormVisible = (visible: boolean) => {
    setFormState({ ...formState, email: '', password: '', company: '', username: '' })
    setFormVisiable(visible)
  }

  useEffect(() => {
    getSession()
    document.title = 'yunsoo资产管理系统'

    const handleLoad = () => {
      setIsSpining(false)
    }

    setIsSpining(true)
    window.addEventListener('load', handleLoad)


    if (document.readyState === 'complete') {
      setIsSpining(false)
    }

    // 组件卸载时移除事件监听
    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  return (
    <>
      {/* {isSpining && <MaskLoad />} */}
      {!mySession && !isSpining && (
        <div>
          <Transation/>
          {isVerify? <Verify emailAddress={formState.email} /> : ( 
            <div className={authScss.background}>
              <div className={authScss.signUpForm}>
                <div className='w-40 my-6 mx-auto'>
                  <img className='w-full' src="https://www.wangle.run/company_icon/public_image/system_logo.png" alt="system-logo" />
                </div>
                {/* <h3>Assets Management</h3> */}
                <span className={authScss.line}></span>
                {formVisiable? (
                  <>
                    {/* sign up */}
                    <form>
                      <ul className={authScss.commitForm}>
                        <li className={authScss.commitFormItem}>
                          <span className='ml-1 mb-1 text-[14px]'>电子邮箱</span>
                          <Input
                            placeholder="请输入邮箱"
                            value={formState.email}
                            onChange={changeEmailValue}
                            onKeyDown={onPressEnterSigin}
                            allowClear
                            className='h-9'
                          />
                        </li>
                        <li className={authScss.commitFormItem}>
                          <div className='flex items-center'>
                            <span className='ml-1 mr-1 mb-1 text-[14px]'>密码</span>
                            <Tooltip
                              placement='right'
                              title='密码必须包含8-20个字符，至少包含一个大写字母、一个小写字母和一个数字'
                            >
                              <InfoCircleOutlined className='text-sm -mt-1 text-blue-700' />
                            </Tooltip>
                          </div>
                          <Input.Password
                            placeholder="请输入密码"
                            value={formState.password}
                            onChange={changePasswordValue}
                            onKeyDown={onPressEnterSigin}
                            allowClear
                            className='h-9'
                          />
                        </li>
                        <li className={authScss.commitFormItem}>
                          <span className='ml-1 mb-1 text-[14px]'>公司名称</span>
                          <Input
                            placeholder="请输入公司名称"
                            value={formState.company}
                            onChange={changeCompanyValue}
                            onKeyDown={onPressEnterSigin}
                            allowClear
                            className='h-9'
                          />
                        </li>
                        <li className={authScss.commitFormItem}>
                          <span className='ml-1 mb-1 text-[14px]'>用户名</span>
                          <Input
                            placeholder="请输入用户名"
                            value={formState.username}
                            onChange={changeUsernameValue}
                            onKeyDown={onPressEnterSigin}
                            allowClear
                            className='h-9'
                          />
                        </li>
                      </ul>
                      <Button
                        type="primary"
                        className={authScss.commitButton}
                        size="large"
                        onClick={() => validateSignUpForm(1)}
                        style={{
                          background: 'linear-gradient(135deg, #6253E1, #04BEFE)',
                          border: 'none',
                        }}
                      >
                        创建账号
                      </Button>
                    </form>
                    <p className={authScss.commitFormInfo}>
                      已有账号？
                      <a onClick={() => changeFormVisible(false)}>立即登录</a>
                    </p>
                  </>
                ) : (
                  <>
                    {/* sign in */}
                    <form>
                      <ul className={authScss.commitForm}>
                        <li className={authScss.commitFormItem}>
                          <span className='ml-1 mb-1 text-[14px]'>电子邮箱</span>
                          <Input
                            placeholder="请输入邮箱"
                            value={formState.email}
                            onChange={changeEmailValue}
                            onKeyDown={onPressEnterSigin}
                            allowClear
                            className='h-9'
                          />
                        </li>
                        <li className={authScss.commitFormItem}>
                          <span className='ml-1 mb-1 text-[14px]'>密码</span>
                          <Input.Password
                            placeholder="请输入密码"
                            value={formState.password}
                            onChange={changePasswordValue}
                            onKeyDown={onPressEnterSigin}
                            allowClear
                            className='h-9'
                          />
                        </li>
                        <div className='flex'>
                          <a
                            className='text-xs ml-auto underline cursor-pointer -mt-1'
                            onClick={() => router.push('/ResetPassword')}
                          >
                            忘记密码？
                          </a>
                        </div>
                      </ul>
                      <Button
                        type="primary"
                        className={authScss.commitButton}
                        size="large"
                        onClick={() => validateSignUpForm(2)}
                      >
                        立即登录
                      </Button>
                    </form>
                    <p className={authScss.commitFormInfo}>
                      还没有账号？ <a onClick={() => changeFormVisible(true)}>立即注册</a>
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )
        
      }
    </>

  )
}
export default Auth