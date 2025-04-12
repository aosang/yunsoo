"use client";
import { Suspense, useEffect, useState } from "react"
import { flexible } from './phone.js'
import { useSearchParams } from "next/navigation"
import { QRCodeSVG } from 'qrcode.react'
import { getCodeAssetsData } from '@/utils/providerItAssetsData'
import { Button, Descriptions, Skeleton } from "antd"
import tempcss from './temp.module.scss'
import html2canvas from "html2canvas"
import { getTimeNumber } from "@/utils/pubFunProvider"
import dayjs from "dayjs"

type myDeviceInfo = {
  loanout_id: string,
  loanout_name: string,
  loanout_time: string,
  loanout_type: string,
  loanout_brand: string,
  loanout_user: string
}

const TemplateCode: React.FC = () => {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [qrCodeData, setQrCodeData] = useState<string>('')
  const [deviceInfo, setDeviceInfo] = useState<myDeviceInfo>({
    loanout_id: '',
    loanout_name: '',
    loanout_time: '',
    loanout_type: '',
    loanout_brand: '',
    loanout_user: ''
  })

  const createQRcodeDataImage = () => {
    let myId = searchParams.get('id')
    if (myId) {
      getCodeAssetsData(myId).then(res => {
        setDeviceInfo(res![0] as myDeviceInfo)
        setQrCodeData(`https://37165a514c.vicp.fun/TemplateCode?id=${myId}`)
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      })
    }
  }

  const saveImageQrcode = () => {
    const element = document.querySelector('#canvas') as HTMLCanvasElement
    html2canvas(element, {
      allowTaint: false,
      useCORS: true,
    })
      .then(canvas => {
        let dataUrl = canvas.toDataURL("image/jpeg");
        let img = new Image()
        img.src = dataUrl
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = 'deviceCode' + getTimeNumber()[1] + '.jpg'
        link.click()
      })
      .catch(err => {
        console.log(err)
      })
  }

  useEffect(() => {
    flexible()
    createQRcodeDataImage()
    document.title = 'Device Code'

  }, [])

  return (
    <div className={tempcss.rootLay}>
      <Skeleton active loading={isLoading} paragraph={{rows: 8}}>
      <div className={tempcss.container}>
        <div id="canvas">
          <div className={tempcss.container_nav}>
            <h2>Device Info</h2>
          </div>
          <div className="w-full pl-[0.16rem] pr-[0.16rem] pt-[0.16rem] pb-0">
            <Descriptions
              column={24}
              style={{ marginBottom: '0.2rem' }}
            >
              <Descriptions.Item label="Loanout-Number" span={24}>
                {deviceInfo.loanout_id}
              </Descriptions.Item>
              <Descriptions.Item label="Device-Name" span={24}>
                {deviceInfo.loanout_name}
              </Descriptions.Item>
              <Descriptions.Item label="Loanout-User" span={24}>
                {deviceInfo.loanout_user}
              </Descriptions.Item>
              <Descriptions.Item label="Loanout-Type" span={24}>
                {deviceInfo.loanout_type}
              </Descriptions.Item>
              <Descriptions.Item label="Loanout-Brand" span={24}>
                {deviceInfo.loanout_brand}
              </Descriptions.Item>
              <Descriptions.Item label="Loanout-Time" span={24}>
                {dayjs(deviceInfo.loanout_time).format('MMM D, YYYY h:mm a')}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {qrCodeData &&
            <div className={tempcss.qrcodeBox}>
              <QRCodeSVG
                value={qrCodeData}
                size={200}
                bgColor="#fff"
                fgColor="#000"
                level="L"
              />
            </div>
          }
          <div className={tempcss.qrcodeWhite}></div>
        </div>

        <div className='mx-auto my-0 w-[2rem]'>
          <Button
            style={{ width: '2rem', height: '0.32rem', fontSize: '0.15rem', display: 'block' }}
            type="primary"
            onClick={saveImageQrcode}
            id="downLink"
          >
            Save Image
          </Button>
        </div>
      </div>
      </Skeleton>    
    </div>
  )
}

const WrappedTemplateCode: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState<boolean>(true)
  useEffect(() => {
    setTimeout(() => {
      setIsSpinning(false)
    }, 1000)
  }, [])
  return (
    <Suspense>
      <TemplateCode />
    </Suspense>
  )
}
export default WrappedTemplateCode
