"use client"
import { ConfigProvider, FloatButton } from "antd"
import { AiOutlineMessage } from "react-icons/ai"

const AIButton = () => {
  
  const getPathname = () => {
    const baseUrl = window.location.origin
    if(baseUrl === 'https://www.wangle.run') {
      window.open(baseUrl + '/assetsmanager/Aiassistant', '_blank')
    } else {
      window.open(baseUrl + '/Aiassistant', '_blank')
    }
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