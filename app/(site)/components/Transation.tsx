import Image from 'next/image'
import { useEffect, useState } from 'react'

const Transation = () => {
  const [ transationIsShow, setTransationIsShow ] = useState<boolean>(true)

  useEffect(() => {
    setTimeout(() => {
      setTransationIsShow(false)
    }, 1500)
  }, [])

  return (
    <>
      { 
        transationIsShow && 
        <div 
          className="fixed w-full h-lvh top-0 left-0 z-10 bg-slate-50 flex justify-center items-center flex-col">
          <Image 
            src='/assets_logo_transation.png' 
            width={120} height={120} alt='logo'
            className='animate-rotate-slow' 
          />
          <span className='text-xl font-semibold pt-2 text-blue-900'>The File Creating...</span>
        </div>
      }
    </>
  )
}
 
export default Transation