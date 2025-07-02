"use client"
import { ConfigProvider, FloatButton } from "antd"
import { AiOutlineMessage } from "react-icons/ai"
import { usePathname } from "next/navigation"
const AIButton = () => {
  const pathname = usePathname()

  const getPathname = () => {
    const baseUrl = window.location.origin  
    //http://localhost:3000/Home/Librarys/
    // console.log(pathname)
    window.open(baseUrl + '/assetsmanager/Aiassistant', '_blank')
  }

  return (
    <ConfigProvider theme={{
      components: {
        FloatButton: {
          colorPrimaryHover: '#1677ff',
        },
      },
    }}>
      <FloatButton
        description={
          <div className="flex items-center">
            <AiOutlineMessage className="text-[20px] mr-1" /> 
            <span className="text-[15px] block">AI小助手</span>
          </div>
        }
        shape="square"
        type="primary"
        style={{ 
          right: 24, 
          width: 130, 
          height: 36,
          bottom: 84,
        }}
        onClick={getPathname}
      />
    </ConfigProvider>
  )
}

export default AIButton