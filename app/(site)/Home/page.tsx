"use client"
import { useEffect, useState } from 'react'
import { Card, Space, Col, Row, Tag, Skeleton } from 'antd'
import { AiOutlineBars, AiOutlineCheck, AiOutlineFileSync, AiOutlinePause } from 'react-icons/ai'
import { FiMonitor, FiPrinter } from 'react-icons/fi'
import { MdOutlineComputer, MdOutlineScreenshotMonitor, MdOutlineOtherHouses } from "react-icons/md"
import { HiOutlineServer } from "react-icons/hi"
import { HiMiniDevicePhoneMobile } from "react-icons/hi2"
import { BsToggles } from "react-icons/bs"
import { LuMouse, LuRouter } from "react-icons/lu"
import CountUp from 'react-countup'

import Script from 'next/script'
import Head from 'next/head'

import { getWorkOrderCount, getAllAssetsCount, getTotalAssetsPrice } from '@/utils/providerSelectData'

const workCardInfo: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  height: '130px',
  borderRadius: '12px',
  padding: '16px 48px',
  alignItems: 'center',
}

const workIcon: React.CSSProperties = {
  width: '80px',
  height: '80px',
  borderRadius: '100%',
  background: 'rgba(255, 255, 255, 0.3)',
}

const workIconText: React.CSSProperties = {
  display: 'block',
  margin: '24px auto',
  color: '#fff',
}

const workTotal: React.CSSProperties = {
  color: '#fff',
  margin: '0 0 0 auto'
}

const assetsInfo: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  height: '90px',
  background: '#fff',
  boxShadow: '0px 0px 2px 2px #ececec',
  borderRadius: '12px',
  padding: '0 24px',
  alignItems: 'center',
  color: '#333'
}

const assetsTotal: React.CSSProperties = {
  margin: '0 0 0 auto',
}

const assetsText: React.CSSProperties = {
  fontSize: '24px'
}

const Home = () => {
  const [isSpiningLoading, setIsSpiningLoading] = useState<boolean>(true)
  const [isDeviceLoading, setDeviceLoading] = useState<boolean>(true)

  const [finishedNum, setFinishedNum] = useState<number>(0)
  const [processingNum, setProcessingNum] = useState<number>(0)
  const [pendingNum, setPendingNum] = useState<number>(0)
  const [totalNum, setTotalNum] = useState<number>(0)

  const [computerNum, setComputerNum] = useState<number>(0)
  const [laptopNum, setLaptopNum] = useState<number>(0)
  const [serverNum, setServerNum] = useState<number>(0)
  const [switchNum, setSwitchNum] = useState<number>(0)
  const [printerNum, setPrinterNum] = useState<number>(0)
  const [routerNum, setRouterNum] = useState<number>(0)
  const [mobileNum, setMobileNum] = useState<number>(0)
  const [monitorNum, setMonitorNum] = useState<number>(0)
  const [keyboardMouseNum, setKeyboardMouseNum] = useState<number>(0)
  const [othersNum, setOthersNum] = useState<number>(0)
  const [totalAssetsNum, setTotalAssetsNum] = useState<number>(0)

  const [totalAssetsPrice, setTotalAssetsPrice] = useState<number>(0)

  const fetchWorkOrderCount = async () => {
    const res = await getWorkOrderCount()
    setFinishedNum(res.finished)
    setProcessingNum(res.processing)
    setPendingNum(res.pending)
    setTotalNum(res.total)

    setIsSpiningLoading(false)
  }

  const fetchITAssetsCount = async () => {
    const res = await getAllAssetsCount()

    setComputerNum(res.computerNum)
    setLaptopNum(res.laptopNum)
    setServerNum(res.serverNum)
    setSwitchNum(res.switchNum)
    setPrinterNum(res.printerNum)
    setRouterNum(res.routerNum)
    setMobileNum(res.mobileNum)
    setMonitorNum(res.monitorNum)
    setKeyboardMouseNum(res.keyboardMouseNum)
    setOthersNum(res.othersNum)
    setTotalAssetsNum(res.total)

    setDeviceLoading(false)
  }

  const fetchITAssetsPrice = async () => {
    let res = await getTotalAssetsPrice()
    setTotalAssetsPrice(res)
  }

  useEffect(() => {
    fetchWorkOrderCount()
    fetchITAssetsCount()
    fetchITAssetsPrice()
    document.title = '综合信息'
    
  }, [])

  return (
    <div style={{ width: '100%', padding: '12px', boxSizing: 'border-box' }}>
      <div>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Card title="工单信息">
            <Skeleton active loading={isSpiningLoading}>
              <Row gutter={20}>
                <Col span={6}>
                  <div style={workCardInfo} className="bg-[#54a0ff]">
                    <div className='w-[72px] h-[72px] rounded-2xl bg-[rgba(255,255,255,0.3)]'>
                      <AiOutlineBars className='mt-5 mx-auto text-white block' size={30} />
                    </div>
                    <div style={workTotal}>
                      <span style={{ fontSize: '36px', fontWeight: '600' }}>
                        <CountUp end={totalNum} duration={2} delay={0.5} />
                      </span>
                      <p style={{ fontSize: '15px' }}>总计</p>
                    </div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={workCardInfo} className="bg-[#10ac84]">
                    <div style={workIcon}>
                      <AiOutlineCheck style={workIconText} size={30} />
                    </div>
                    <div style={workTotal}>
                      <span style={{ fontSize: '36px', fontWeight: '600' }}>
                        <CountUp end={finishedNum} duration={2} delay={0.5} />
                      </span>
                      <p style={{ fontSize: '15px' }}>已完成</p>
                    </div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={workCardInfo} className="bg-[#ee5253]">
                    <div className='w-[72px] h-[72px] rounded-2xl bg-[rgba(255,255,255,0.3)]'>
                      <AiOutlineFileSync style={workIconText} size={30} />
                    </div>
                    <div style={workTotal}>
                      <span style={{ fontSize: '36px', fontWeight: '600' }}>
                        <CountUp end={processingNum} duration={2} delay={0.5} />
                      </span>
                      <p style={{ fontSize: '15px' }}>处理中</p>
                    </div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={workCardInfo} className="bg-[#f39c12]">
                    <div style={workIcon}>
                      <AiOutlinePause style={workIconText} size={30} />
                    </div>
                    <div style={workTotal}>
                      <span style={{ fontSize: '36px', fontWeight: '600' }}>
                        <CountUp end={pendingNum} duration={2} delay={0.5} />
                      </span>
                      <p style={{ fontSize: '15px' }}>待处理</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Skeleton>
          </Card>

        </Space>
        <Space direction="vertical" size={12} style={{ width: '100%', marginTop: '12px' }}>
          <Card title="资产信息">
            <Skeleton active loading={isDeviceLoading}>
              <Row gutter={15}>
                <Col span={4} >
                  <div style={assetsInfo}>
                    <FiMonitor size={26} />
                    <div style={assetsTotal}>
                      <span style={assetsText} className='block text-right'>{computerNum}</span>
                      <p className='block text-right'>电脑</p>
                    </div>
                  </div>
                </Col>

                <Col span={4} >
                  <div style={assetsInfo}>
                    <MdOutlineComputer size={26} />
                    <div style={assetsTotal}>
                      <span style={assetsText} className='block text-right'>{laptopNum}</span>
                      <p className='block text-right'>笔记本</p>
                    </div>
                  </div>
                </Col>
                <Col span={4} >
                  <div style={assetsInfo}>
                    <HiOutlineServer size={26} />
                    <div style={assetsTotal}>
                      <span style={assetsText} className='block text-right'>{serverNum}</span>
                      <p className='block text-right'>服务器</p>
                    </div>
                  </div>
                </Col>

                <Col span={4} >
                  <div style={assetsInfo}>
                    <BsToggles size={26} />
                    <div style={assetsTotal}>
                      <span style={assetsText} className='block text-right'>{switchNum}</span>
                      <p className='block text-right'>交换机</p>
                    </div>
                  </div>

                </Col>
                <Col span={4}>
                  <div style={assetsInfo}>
                    <FiPrinter size={26} />
                    <div style={assetsTotal}>
                      <span style={assetsText} className='block text-right'>{printerNum}</span>
                      <p className='block text-right'>打印机</p>
                    </div>
                  </div>
                </Col>

                <Col span={4}>
                  <div style={assetsInfo}>
                    <LuRouter size={26} />
                    <div style={assetsTotal}>
                      <span style={assetsText} className='block text-right'>{routerNum}</span>
                      <p className='block text-right'>路由器</p>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row gutter={15} className='mt-4'>
                <Col span={4}>
                  <div style={assetsInfo}>
                    <HiMiniDevicePhoneMobile size={26} />
                    <div style={assetsTotal}>
                      <span style={assetsText} className='block text-right'>{mobileNum}</span>
                      <p className='block text-right'>手机</p>
                    </div>
                  </div>
                </Col>
                <Col span={4}>
                  <div style={assetsInfo}>
                    <MdOutlineScreenshotMonitor size={26} />
                    <div style={assetsTotal}>
                      <span style={assetsText} className='block text-right'>{monitorNum}</span>
                      <p className='block text-right'>显示器</p>
                    </div>
                  </div>
                </Col>
                <Col span={4}>
                  <div style={assetsInfo}>
                    <LuMouse size={26} />
                    <div style={assetsTotal}>
                      <span style={assetsText} className='block text-right'>{keyboardMouseNum}</span>
                      <p className='block text-right'>键盘/鼠标</p>
                    </div>
                  </div>
                </Col>
                <Col span={4}>
                  <div style={assetsInfo}>
                    <MdOutlineOtherHouses size={26} />
                    <div style={assetsTotal}>
                      <span style={assetsText} className='block text-right'>{othersNum}</span>
                      <p className='block text-right'>其他</p>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div
                    className='
                        bg-white 
                        content-center
                        rounded-xl 
                        py-0 
                        px-6 
                        items-center
                        shadow-[0_0_2px_2px_#ececec]'
                    style={{ height: '90px' }}
                  >
                    <Row gutter={15}>
                      <Col span={12}>
                        <div className='w-full h-full border-r border-slate-200'>
                          <p className='text-2xl font-bold text-slate-500 mb-1'>CNY {totalAssetsPrice}</p>
                          <Tag color='green'>资产总价</Tag>
                        </div>
                      </Col>

                      <Col span={12}>
                        <div className='w-full h-full pl-5'>
                          <p className='text-2xl font-bold text-slate-500 mb-1'>{totalAssetsNum}</p>
                          <Tag color='blue'>资产总数</Tag>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Skeleton>
          </Card>
        </Space>
      </div>
    </div>
  )
}

export default Home 