'use client'
import { useState, useEffect } from "react"
import { supabase } from "@/utils/clients"
import { Upload, Table } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import dayjs from "dayjs"
import * as XLSX from 'xlsx'

const { Dragger } = Upload

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
    title: 'Time',
    dataIndex: 'time',
    key: 'time',
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
        time: dayjs().format('YYYY-MM-DD HH:mm:ss')
      })))
    }
  }

  useEffect(() => {
    getTableData()
  }, [])

  return (
    <div>
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