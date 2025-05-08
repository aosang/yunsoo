"use client"
import { useEffect } from 'react'

export const dynamic = "force-static"; // 强制静态生成

export default function NotFound() {
  useEffect(() => {
    document.title = '404页面丢失了'
  }, [])
  return (
    <div className='w-[1260px] my-0 mx-auto h-[560px] fixed top-[20%] left-[50%] translate-x-[-50%] translate-y-[-20%]'>
      <div className='w-full h-full flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-8'>
        <div>
          <div className='block text-[100px] text-center text-blue-300'>404</div>
          <div className='text-[24px] font-bold text-center text-blue-400 mt-2'>页面丢失了~~</div>
        </div>
      </div>
    </div>
  )
}