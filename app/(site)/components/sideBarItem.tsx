import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import { useRouter } from 'next/navigation'
import {useState, useEffect} from 'react'
import { AiFillProfile  } from "react-icons/ai"
import { GoHomeFill } from "react-icons/go"
import { RiComputerFill  } from 'react-icons/ri'
import { FaUser } from "react-icons/fa"
import { IoDocumentText, IoLibrary } from "react-icons/io5"
import { MdInventory } from "react-icons/md"

type MenuItem = Required<MenuProps>['items'][number]

const items: MenuItem[] = [{
  key: 'Home',
  label: '综合信息',
  icon: <GoHomeFill style={{fontSize: '16px'}} />,
  style: {
    marginBottom: '12px'
  }
}, {
  key: 'WorkOrder',
  label: '我的工单',
  icon: <AiFillProfile style={{fontSize: '16px'}} />,
  style: {
    marginBottom: '12px'
  }
}, {
  key: 'Inventory',
  label: '库存管理',
  icon: <MdInventory style={{fontSize: '16px'}} />,
  style: {
    marginBottom: '12px'
  }
}, {
  key: 'Inspection',
  label: '巡检记录',
  icon: <IoDocumentText style={{fontSize: '16px'}} />,
  style: {
    marginBottom: '12px'
  }
}, {
  key: 'Librarys',
  label: '知识库',
  icon: <IoLibrary style={{fontSize: '16px'}} />,
  style: {
    marginBottom: '12px'
  }
}, {
  key: 'WorkItAssets',
  label: 'IT设备',
  icon: <RiComputerFill style={{fontSize: '16px'}} />,
  style: {
    marginBottom: '12px'
  }
}, {
  key: 'Profile',
  label: '个人设置',
  icon: <FaUser style={{fontSize: '16px'}} />,
}]

const SideBarItem: React.FC = () => {
  const router = useRouter()
  const [currentUrl, setCurrentUrl] = useState<string>('')
  
  const extractCurrentPath = () => {
    const pathname = window.location.pathname
    if (pathname === '/' || pathname === '/Home') {
      return 'Home'
    }

    // 从路径中提取最后一个部分作为当前页面key
    const pathParts = pathname.split('/')
    const lastPart = pathParts[pathParts.length - 1]
    
    // 如果最后部分为空（路径以/结尾），则取倒数第二部分
    return lastPart || pathParts[pathParts.length - 2] || 'Home'
  }
  
  const switchMenuItem: MenuProps['onClick'] = (e: any) => {
    // 直接设置当前URL，避免等待路由变化后的useEffect
    setCurrentUrl(e.key)
    
    // 然后执行路由跳转
    const path = e.key === 'Home' ? `/${e.key}` : `/Home/${e.key}`
    router.push(path)
  }

  useEffect(() => {
    setCurrentUrl(extractCurrentPath())
    
    // 仅监听浏览器的前进/后退操作
    const handlePopState = () => {
      setCurrentUrl(extractCurrentPath())
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return (
    <div>
      <Menu 
        selectedKeys={[currentUrl]}
        theme='dark' 
        mode='inline' 
        items={items}
        onClick={switchMenuItem}
      />
    </div>   
  )
}

export default SideBarItem