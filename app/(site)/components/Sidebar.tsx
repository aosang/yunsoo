"use client"
import { Layout } from 'antd';
import SideBarItem from './sideBarItem'
import DropDownMenu from './dropDownMenu'

const { Header, Content, Footer, Sider } = Layout;

const siderStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100vh',
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#001529',
  zIndex: 1
}

const headerStyle: React.CSSProperties = {
  position: 'fixed',
  width: '86.5%',
  top: '0',
  right: '0',
  color: '#001529',
  height: 64,
  lineHeight: '64px',
  backgroundColor: '#fff',
  zIndex: 1,
}

const contentStyle: React.CSSProperties = {
  width: 'calc(100% - 13.5%)',
  margin: '64px 0 48px auto',
}

const footerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  right: 0,
  width: 'calc(100% - 13.5%)',
  height: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#001529',
  zIndex: 999
}


const AppLayout = ({children, userId, update}) => {  
  return (
    <div>
      <Layout style={{ minHeight: '100vh'}}>
        <Sider width="13.5%" style={siderStyle}>
          <div className='
            h-16
            text-white 
            text-lg
            leading-64 
            whitespace-nowrap
            border-b
            border-gray-500'
          >
            <div className='w-40 mx-auto p-4'>
              <img className='w-full' src="https://www.wangle.run/company_icon/public_image/system_logo_white.png" alt="system-logo" />
            </div>
          </div>
          <SideBarItem />
        </Sider>
        <Layout>
          <Header style={headerStyle}>
            <DropDownMenu />
          </Header>
          <Content style={contentStyle}>
            {children}
          </Content>
          <Footer style={footerStyle} className='bg-gray-200'>yunsoo with StevenWang ©2025</Footer>
        </Layout>
      </Layout>
    </div>
  )
}

export default AppLayout;
