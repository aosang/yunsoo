'use client'
import { useEffect, useState, Suspense } from 'react'
import { Divider, FloatButton, Skeleton } from 'antd'
import { FilePptOutlined, PictureOutlined, VerticalAlignTopOutlined } from '@ant-design/icons'
import { useSearchParams } from "next/navigation"
import { getLibrarysDataList } from "@/utils/provideLibraryData"
import { getTimeNumber } from '@/utils/pubFunProvider'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const KnowledgeTemplate = () => {
  const searchParams = useSearchParams()
  const [librarysData, setLibrarysData] = useState([
    {
      title: '',
      type: '',
      author: '',
      content: '',
      created_time: '',
    }
  ])
  const [isLoading, setIsLoading] = useState(true)
  const getLibrarysDataDtails = () => { 
    const id = searchParams.get('KnowledgeId')
    if (id) {
      getLibrarysDataList(id).then(res => {
        setLibrarysData(res as [])
      })
    }

    setIsLoading(false)
  }
  
  const exportPdfandImage = (num: number) => {
    const element = document.querySelector('#knowledgeContainer') as HTMLDivElement
    html2canvas(element, {
      allowTaint: false,
      useCORS: true,
      scale: 2
    })
    .then(canvas => {
      let context = canvas.getContext("2d")
      context!.imageSmoothingEnabled = false
      let width = element.offsetWidth / 4;
      let height = element.offsetHeight / 4;


      let pageData = canvas.toDataURL("image/jpeg", 1.0)
      let img = new Image()
      img.src = pageData

      if(num === 1) {
        img.onload = () => {
          img.width = img.width / 2;
          img.height = img.height / 2;
          img.style.transform = "scale(1)"
          if (width > height) {
            var pdf = new jsPDF("l", "mm", [width * 1, height * 1])
          } else {
            var pdf = new jsPDF("p", "mm", [width * 1, height * 1])
          }
          let pdfName = getTimeNumber()[1]
          pdf.addImage(pageData, "jpeg", 0, 0, width * 1, height * 1)
          pdf.save(pdfName + 'knowledge' + ".pdf");
        }
      }else {
        const link = document.createElement('a')
        link.href = pageData
        link.download = 'knowledge' + getTimeNumber()[1] + '.jpg'
        link.click()
      }
    })
    .catch(err => {
      console.log(err)
    })
  }

  useEffect(() => {
    getLibrarysDataDtails()
    document.title = 'Knowledge Document'
  }, [])
  return (
    <>
      <Skeleton loading={isLoading} active paragraph={{rows: 8}} className='p-4 mt-9'>
        <div className='relative'>
          <FloatButton.Group>
            <FloatButton 
              icon={<FilePptOutlined />} 
              shape='square'
              type='primary'
              description='PDF'
              className='w-14 h-14'
              onClick={() => exportPdfandImage(1)}
            />

            <FloatButton 
              icon={<PictureOutlined />}
              shape='square'
              type='primary'
              description='Image'
              className='w-14 h-14'
              onClick={() => exportPdfandImage(2)}
            />

            <FloatButton 
              icon={<VerticalAlignTopOutlined className='text-xl text-center' />}
              shape='square'
              className='w-14 h-14'
              onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
            />

            {/* <FloatButton 
              icon={<ArrowLeftOutlined className='text-xl text-center' />}
              shape='square'
              className='w-14 h-14'
              onClick={() => router.back()}
            /> */}
          </FloatButton.Group>
        <div 
          className="bg-white p-2 mx-auto my-4 rounded-lg min-h-[950px]"
          style={{width: '760px'}}
          id='knowledgeContainer'
        >
            <div style={{backgroundColor: '#f0f5ff'}} className='w-full p-4'>
              <h3 className='text-xl font-semibold tracking-wider '>{librarysData[0].title}</h3>
            </div>
            <div className='flex text-sm pl-3 pt-3'>
              <p className='mr-4 text-gray-400'>Author: {librarysData[0].author}</p>
              <p className='mr-4 text-gray-400'>Time: {librarysData[0].created_time}</p>
              <p className='mr-4 text-gray-400'>Type: {librarysData[0].type}</p>
            </div>
            <Divider />
            <div
              dangerouslySetInnerHTML={{__html: librarysData[0].content}}
              className={`
                text-gray-600 
                text-sm
                px-4
                box-border
                leading-7
                [&_img]:!w-[100%] 
                [&_img]:!h-auto 
                [&_img]:mb-5
                [&_img]:mx-auto
                [&_img]:rounded-lg
              `}
            >
            </div>
          </div> 
        </div>
      </Skeleton>
    </>
  )
}

const KnowledgeTemplateHtml: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KnowledgeTemplate />
    </Suspense>
  )
}
 
export default KnowledgeTemplateHtml