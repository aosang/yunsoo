"use client"
import { Card } from 'antd'
import { FileSearchOutlined } from '@ant-design/icons'
import { useEffect } from 'react'
const NotFound = () => {
  useEffect(() => {
    document.title = '404页面丢失了'
  }, [])
  return (
    <div className='w-[1260px] my-0 mx-auto h-[560px] fixed top-[20%] left-[50%] translate-x-[-50%] translate-y-[-20%]'>
      <Card className='w-full h-full flex flex-col items-center justify-center'>
        <div>
          <FileSearchOutlined className='block text-[100px] text-center text-blue-300' />
          <div className='text-[24px] font-bold text-center text-blue-400 mt-2'>页面丢失了~~</div>
        </div>
      </Card>
    </div>
  )
}

export default NotFound