'use client'
import { useState, useEffect } from "react"
import { supabase } from "@/utils/clients"
import { Upload, Table } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import * as XLSX from 'xlsx'
import { Input, Button } from 'antd'

const { Dragger } = Upload

// 启用插件
dayjs.extend(utc)
dayjs.extend(timezone)

// 格式化timestamptz时间
const formatTimestamptz = (timestamptz: string) => {
  console.log(timestamptz)
  if (!timestamptz) return '';
  
  // 将UTC时间转换为东八区(Asia/Shanghai)时间
  return dayjs(timestamptz).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
}

type tableDataProps = {
  order: number
  name: string
  age: number
  address: string
}

const Test = () => {
  const [tableData, setTableData] = useState<tableDataProps[]>([])
  const columns = [{
    title: 'No.',
    dataIndex: 'order',
    key: 'order',
  },
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
    render: (text: string) => {
      return formatTimestamptz(text)
    }
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  }, {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  }]

  const handleUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const binaryString = e.target?.result as string
      const wb = XLSX.read(binaryString, { type: 'binary' })
      const sheetName = wb.SheetNames[0]
      const sheet = wb.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      const { data: insertedData, error } = await supabase.from('test_table').upsert(jsonData)
      if (error) {
        console.log(error)
      } else {
        setTableData(insertedData! as tableDataProps[])
        getTableData()
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel'
      if (!isExcel) {
        alert('只能上传Excel文件!');
      }
      return isExcel;
    },

    customRequest: (options) => {
      handleUpload(options.file)
      options.onSuccess()
    }
  }

  const getTableData = async () => {
    const { data, error } = await supabase.from('test_table').select('*')
    if (error) {
      console.log(error)
    } else {
      setTableData((data! as tableDataProps[]).map((item, index) => ({
        ...item,
        order: index + 1,
        // time: dayjs().format('YYYY-MM-DD HH:mm:ss')
      })))
    }
  }

  useEffect(() => {
    getTableData()
  }, [])

  return (
    <div>
      {/* 手机号 */}
      <div className="flex items-center justify-center flex-col mt-4">
        <Input 
          type="phone" 
          className="w-[260px] h-10 mb-3 rounded-md border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200" 
          placeholder="请输入手机号" 
        />
        <Input 
          type="text" 
          className="w-[260px] h-10 mb-3 rounded-md border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          placeholder="请输入验证码" 
        />
        <Button 
          type="primary"
          className="w-[260px] h-10 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium transition duration-200"
        >
          获取验证码
        </Button>
        <Button 
          type="primary"
          className="w-[260px] h-10 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium transition duration-200 mt-2"
        >
          登录
        </Button>
      </div>


      <div className="text-center mt-9 p-9">
        <Dragger {...uploadProps} showUploadList={false}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibited from uploading company data or other
            banned files.
          </p>
        </Dragger>
        {/* <Upload {...uploadProps} showUploadList={false}>
          <Button type='primary' icon={<UploadOutlined />}>Upload</Button>
        </Upload> */}
        <Table className='mt-9' dataSource={tableData} columns={columns} />
      </div>
    </div>

  )
}

export default Test