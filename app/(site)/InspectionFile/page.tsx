'use client'
import React, { useEffect, useState, useRef } from "react"
import { Descriptions, Divider, Table, Result, Button, Modal } from "antd"
import { DownloadOutlined  } from '@ant-design/icons'
import { inspectionForms } from '@/utils/dbType'
import { getSession } from "@/utils/providerSelectData"
import Transation from "../components/Transation"
import { getTimeNumber } from "@/utils/pubFunProvider"
import html2Canvas from "html2canvas"
import jsPDF from "jspdf"
import { useRouter } from "next/navigation"

const InspectionFile: React.FC = () => {
  const [isModalOpenWindow, setIsModalOpenWindow] = useState(false)
  const router = useRouter()
  const columns = [{
      title: '设备名称',
      dataIndex: 'inspection_device',
      key: 'inspection_device',
    },
    {
      title: '问题描述',
      dataIndex: 'inspection_description',
      key: 'inspection_description',
    }]

  const [createPdfData, setCreatePdfData] = useState<inspectionForms>({
    inspection_id: '',
    inspection_time: '',
    inspection_number: 0,
    inspection_phone: '',
    inspection_name: '',
    inspection_email: '',
    inspection_status: '',
    inspection_deviceData: []
  })
  const [createPdfCompanyName, setCreateCompanyPdfName] = useState<string>('')
  const contentRef = useRef<HTMLDivElement | null>(null)

  const getInspectioPdfData = () => {
    let inspectionData = window.sessionStorage.getItem('inspectionData') as unknown
    inspectionData =  JSON.parse(inspectionData as string)
    if(inspectionData === null || inspectionData === undefined) { 
      router.push('/not-found')
    }else {
      setCreatePdfData({
        inspection_id: inspectionData![0].inspection_id || '',
        inspection_time: inspectionData![0].inspection_time || '',
        inspection_number: inspectionData![0].inspection_number || 0,
        inspection_phone: inspectionData![0].inspection_phone || '',
        inspection_name: inspectionData![0].inspection_name || '',
        inspection_email: inspectionData![0].inspection_email || '',
        inspection_status: inspectionData![0].inspection_status || '',
        inspection_deviceData: inspectionData![0].inspection_deviceData || []
      }) 
    }
  }

  const getCompanyPdfName = () => {
    getSession().then(res => {
      setCreateCompanyPdfName(res!.session?.user.user_metadata.company)
    })
  }


  const exportInspectionPdfFile = () => {
    let shareContent = document.getElementById('contentRef')
    let width = shareContent!.offsetWidth / 4;
    let height = shareContent!.offsetHeight / 4;

    const pdfContent = contentRef.current
    if(pdfContent) {
      html2Canvas(pdfContent, {
        allowTaint: false,
        scale: 2,
        useCORS: true,
      }).then(canvas => {
        let context = canvas.getContext("2d")
        context!.imageSmoothingEnabled = false

        let pageData = canvas.toDataURL("image/jpeg", 1.0)
        let img = new Image()
        img.src = pageData

        img.onload = () => {
          img.width = img.width / 2;
          img.height = img.height / 2;
          img.style.transform = "scale(1)";
          if (width > height) {
            var pdf = new jsPDF("l", "mm", [width * 1.005, height * 1.045]);
          } else {
            var pdf = new jsPDF("p", "mm", [width * 1.005, height * 1.045]);
          }
          let pdfName = getTimeNumber()[1]
          pdf.addImage(pageData, "jpeg", 0, 0, width * 1.005, height * 1.045)
          pdf.save(pdfName + 'inspection' + ".pdf");
        }
      })
    }
    
  }

  useEffect(() => {
    document.title = '巡检记录报告'
    getInspectioPdfData()
    getCompanyPdfName()
  }, [])

  return (
    <>
      <Modal 
        title="提示" 
        open={isModalOpenWindow} 
        maskClosable={false}
        onOk={() => {}}
        footer={null}
        closeIcon={null}
      >
        <p>巡检数据不存在，请关闭页面</p>
      </Modal>
      <Button 
        type="primary" 
        shape="circle" 
        className="w-16 h-16 flex flex-col fixed right-5 bottom-16"
        onClick={exportInspectionPdfFile}
      >
        <DownloadOutlined className="text-xl -mt-1 block" />
        <p className="-mt-3">PDF</p>
      </Button>
      <Transation />
      <div 
        style={{width: '720px', minHeight: '850px'}} 
        className="bg-white my-4 mx-auto py-4 px-5 rounded-md relative"
        id='contentRef'
        ref={contentRef}
      >
        <div className="pb-6">
          <div className="w-36 float-left">
            <img 
              className="w-full" 
              src='https://www.wangle.run/company_icon/public_image/system_logo.png' 
              alt="It assets logo" 
            />
          </div>
          <div className="mb-0 mr-0 ml-auto font-bold text-xl float-right">{createPdfCompanyName}</div>
        </div>
        
        <Divider />
        <Descriptions>
          <Descriptions.Item label="巡检员">{createPdfData.inspection_name}</Descriptions.Item>
          <Descriptions.Item label="巡检时间">{createPdfData.inspection_time}</Descriptions.Item>
          <Descriptions.Item label="巡检状态">{createPdfData.inspection_status}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{createPdfData.inspection_phone}</Descriptions.Item>
          <Descriptions.Item label="电子邮箱">{createPdfData.inspection_email}</Descriptions.Item>
        </Descriptions>
        <Divider></Divider>

        {
          createPdfData.inspection_deviceData?.length !== 0 && 
          <Table 
            columns={columns} 
            dataSource={createPdfData.inspection_deviceData} 
            pagination={false}
            bordered
          >
          </Table>
        }
        
        {
          createPdfData.inspection_deviceData?.length === 0 &&
            <Result
              status="success"
              title="所有设备正常"
              subTitle="本次巡检未发现异常"
          />
        }

        <div className="absolute bottom-7">
          <Divider />
          <div className="mt-3">
            <span className="mb-8" style={{fontSize: '15px'}}>检查员签名:</span>
            <span style={{fontSize: '15px'}}>责任人签名:</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default InspectionFile