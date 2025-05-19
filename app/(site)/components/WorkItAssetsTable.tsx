'use client'
import { useEffect, useState } from 'react'
import { getTimeNumber } from '@/utils/pubFunProvider'
import { typeDataName, typeDataBrand, productItem } from '@/utils/dbType'
import { Button, Row, Col, Select, DatePicker, Table, Modal, Divider, Space, Input, InputNumber, Upload, Skeleton } from 'antd'
import { getWorkOrderType, getWorkBrand } from '@/utils/providerSelectData'
import { insertItAssets, deleteItAssets, searchItAssetsData, getItAssetsTabbleData, editItAssetsData, uploadExcelItAssetsData } from '@/utils/providerItAssetsData'
import { IoIosSearch } from 'react-icons/io'
import { InboxOutlined } from '@ant-design/icons'
import useMessage from '@/utils/message'
import * as XLSX from 'xlsx'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// 启用插件
dayjs.extend(utc)
dayjs.extend(timezone)

import locale from 'antd/es/date-picker/locale/zh_CN'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')


// timestamp format
const formatTimestamp = (timestamptz: string) => {
  if (!timestamptz) return '';
  
  // 将UTC时间转换为东八区(Asia/Shanghai)时间
  return dayjs(timestamptz).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
}

const { Dragger } = Upload
type asstesDataProps = productItem[]
type typeDataProps = typeDataName[]
type typeDataBrandProps = typeDataBrand[]

const WorkItAssetsTable: React.FC = () => {
  const [isImportModalShow, setIsImportModalShow] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [assetsData, setAssetsData] = useState<asstesDataProps>([])
  const [filterTypeValue, setFilterTypeValue] = useState<string | null>(null)
  const [filterStartTime, setFilterStartTime] = useState<string>('')
  const [filterEndTime, setFilterEndTime] = useState<string>('')

  const [layoutWidth, setLayoutWidth] = useState<number>(8)
  const [productBrandShow, setProductBrandShow] = useState<boolean>(false)
  const [selectOpen, setSelectOpen] = useState<boolean>(false)

  const [isModalDelete, setIsModalDelete] = useState<boolean>(false)
  const [isEditModalShow, setIsEditModalShow] = useState<boolean>(false)
  const [isEditId, setIsEditId] = useState<string>('')

  const [deleteAssetsDataId, setDeleteAssetsDataId] = useState<string[]>([])
  const [addItAssetsShow, setAddItAssetsShow] = useState(false)
  const [typeData, setTypeData] = useState<typeDataProps>([])
  const [typeDataBrand, setTypeDataBrand] = useState<typeDataBrandProps>([])
  const [assetsDataForm, setAssetsDataForm] = useState<productItem>({
    id: '',
    product_number: 0,
    product_name: '',
    product_time: '',
    product_update: '',
    product_type: null,
    product_brand: null,
    product_username: '',
    product_price: 0,
    product_remark: '',
    value: ''
  })

  const [columns, setColumns] = useState([
    {
      title: '类型',
      dataIndex: 'product_type',
      key: 'product_type',
      width: 150
    }, {
      title: '品牌',
      dataIndex: 'product_brand',
      key: 'product_brand',
    }, {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name'
    }, {
      title: '创建时间',
      dataIndex: 'product_time',
      key: 'product_time',
      width: 230,
      render: (record: string) => {
        return (
          <div>{formatTimestamp(record)}</div>
        )
      }
    }, {  
      title: '数量',
      dataIndex: 'product_number',
      key: 'product_number'
    }, {
      title: '总价',
      width: 150,
      dataIndex: 'product_price',
      render: (record: number) => {
        return (
          <div>
            {'CNY' + ' ' + record}
          </div>
        )
      }
    }, {
      title: '备注',
      dataIndex: 'product_remark',
      key: 'product_remark'
    }, {
      title: '操作',
      render: (record: productItem) => {
        return (
          <div>
            <Button
              className='mr-2'
              type='primary'
              size='small'
              onClick={() => onRowData.onClick(record)}
              style={{ fontSize: '13px' }}
            >
              编辑
            </Button>
          </div>
        )
      }
    }
  ])


  const onAddItAssets = () => {
    if (assetsDataForm.product_name === '') {
      useMessage(2, '请输入产品名称', 'error')
    } else if (assetsDataForm.product_number <= 0) {
      useMessage(2, '请输入产品数量', 'error')
    } else if (assetsDataForm.product_price <= 0) {
      useMessage(2, '请输入产品价格', 'error')
    } else if (!assetsDataForm.product_type) {
      useMessage(2, '请选择产品类型', 'error')
    } else {
      setAddItAssetsShow(false)
      insertItAssets(assetsDataForm)
        .then(() => {
          getMyItAssetsData()
        })
    }
  }

  const getMyItAssetsData = () => {
    getItAssetsTabbleData()
    .then(res => {
      setAssetsData(res as asstesDataProps)
      setIsLoading(false)
    })
  }

  const modalAddDeviceHandler = () => {
    setAddItAssetsShow(true)
    setAssetsDataForm({
      ...assetsDataForm,
      product_time: getTimeNumber()[0],
      product_update: getTimeNumber()[0]
    })
  }

  const onRowData = {
    onClick: (record: productItem) => {
      setIsEditModalShow(true)
      setIsEditId(record.id)
      setAssetsDataForm({
        ...record,
        product_name: record.product_name,
        product_type: record.product_type,
        product_time: record.product_time,
        product_update: getTimeNumber()[0],
        product_brand: record.product_brand,
        product_number: record.product_number,
        product_price: record.product_price,
        product_remark: record.product_remark,
        value: record.value
      })
    }
  }

  // edit confirm data
  const onConfirmEditAssetsData = () => {
    if (assetsDataForm.product_name === '') {
      useMessage(2, 'Please enter the product name', 'error')
    } else if (!assetsDataForm.product_type) {
      useMessage(2, 'Please select the product type', 'error')
    } else if (assetsDataForm.product_number <= 0) {
      useMessage(2, 'Please select the product number', 'error')
    } else if (assetsDataForm.product_price <= 0) {
      useMessage(2, 'Please enter the product price', 'error')
    } else {
      editItAssetsData(isEditId, assetsDataForm)
        .then(() => {
          setIsEditModalShow(false)
          getMyItAssetsData()
        })
    }
  }

  const selectProductType = (keys: string) => {
    if (keys) {
      getWorkBrand(keys)
        .then(res => {
          let brandData = res![0].product_brand_cn.reverse() as typeDataBrandProps
          brandData = brandData.sort((a, b) => {
            return Number(a.brand_id) - Number(b.brand_id)
          })
          setLayoutWidth(6)
          setProductBrandShow(true)
          setTypeDataBrand(brandData)
          setAssetsDataForm({
            ...assetsDataForm,
            product_type: keys,
            product_brand: brandData[0].value,
          })
        })
    } else {
      setProductBrandShow(false)
      setLayoutWidth(8)
      setAssetsDataForm({
        ...assetsDataForm,
        product_type: null,
        product_brand: null
      })
    }
  }

  const onTriggerSelected = (open: boolean) => {
    setSelectOpen(open)
  }

  const assetsProductBrand = (keys: string) => {
    setAssetsDataForm({
      ...assetsDataForm,
      product_brand: keys
    })
  }

  // clear form data
  const clearAssetsDataForm = () => {
    setProductBrandShow(false)
    setLayoutWidth(8)

    setAssetsDataForm({
      id: '',
      product_name: '',
      product_type: null,
      product_brand: null,
      product_number: 0,
      product_time: '',
      product_update: '',
      product_username: '',
      product_price: 0,
      product_remark: '',
      value: ''
    })
  }

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: productItem[]) => {
      let ids: string[] = []
      selectedRows.forEach(item => {
        ids.push(item.id)
      })
      setDeleteAssetsDataId(ids)
    }
  }

  // Delete data
  const deleteAssetsDataIdHandler = () => {
    if (deleteAssetsDataId.length > 0) return setIsModalDelete(true)
    useMessage(2, '请选择你要删除的数据', 'error')
  }

  // Confirm delete data
  const confirmDeleteAssetsData = () => {
    setIsModalDelete(false)
    deleteItAssets(deleteAssetsDataId)
      .then(() => {
        getMyItAssetsData()
        setFilterTypeValue(null)
        setFilterStartTime('')
        setFilterEndTime('')
      })
  }

  // filter data
  const filterTypeDataText = (e: string) => {
    setFilterTypeValue(e)
  }

  const getTimeFilterData = (dateString: any) => {
    let startTime = dateString ? dateString[0].$d : ''
    let endTime = dateString ? dateString[1].$d : ''
    startTime = startTime ? dayjs(startTime).format('YYYY-MM-DD HH:mm:ss') : ''
    endTime = endTime ? dayjs(endTime).format('YYYY-MM-DD HH:mm:ss') : ''
    setFilterStartTime(startTime)
    setFilterEndTime(endTime)
  }

  const searchFilterItAssetsData = () => {
    searchItAssetsData(filterTypeValue,  filterStartTime, filterEndTime)
    .then(res => {
      setAssetsData(res as asstesDataProps)
    })
  }

  // download excel template
  const downLoadExcelTemplate = () => {
    const templateUrl = 'https://ctfrp48g91ht4obgh0u0.baseapi.memfiredb.com/storage/v1/object/public/file_download/it_template.xlsx'
    const link = document.createElement('a')
    link.href = templateUrl
    link.download = 'it_template.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUploadEvent = (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const binaryString = e.target?.result as string
      const wb = XLSX.read(binaryString, { type: 'binary' })
      const sheetName = wb.SheetNames[0]
      const sheet = wb.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      jsonData.forEach((item:any) => {
        if(!item.product_type || !item.product_brand || !item.product_name || !item.product_number || !item.product_price || !item.value) { 
          useMessage(2, '表格导入失败！请检查表格数据是否正确', 'error')
          return
        }else {
          item.product_time = getTimeNumber()[0]
          item.product_update = getTimeNumber()[0]
        }

        uploadExcelItAssetsData(jsonData as productItem[])
        .then(() => {
          getMyItAssetsData()
          useMessage(2, '表格导入成功!', 'success')
          setIsImportModalShow(false)
        })
      })
    }
    reader.readAsArrayBuffer(file)
  }

  // upload excel template
  const uploadProps = {
    beforeUpload: (file: File) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel'
      if(!isExcel) {
        useMessage(2, '请上传Excel文件', 'error')
      }
      return isExcel
    },

    customRequest: (options: any) => {
      handleUploadEvent(options.file)
      options.onSuccess()
    }
  }

  useEffect(() => {
    getWorkOrderType()
      .then(res => {
        setTypeData(res as typeDataProps)
      })
    getMyItAssetsData()
  }, [])

  return (
    <div>
      {/* import modal */}
      <Modal
        title="Excel模板导入"
        open={isImportModalShow}
        onCancel={() => setIsImportModalShow(false)}
        footer={false}
        width={800}
        maskClosable={false}
      >
        <Divider />
        <Row>
          <Space >
            <Col span={4}>
              <Button 
                color='cyan' 
                variant='solid'
                onClick={downLoadExcelTemplate}
              >
                下载Excel模板
              </Button>
            </Col>
            <Col span={4}>
              <Button color='cyan' variant='solid'>下载说明文档</Button>
            </Col>
          </Space>
        </Row>
        <Dragger 
          className='mt-6' 
          showUploadList={false}
          {...uploadProps}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">单击或拖动Excel文件到此区域进行上传</p>
          <p className="ant-upload-hint">
            支持单次上传。严禁上传业务数据或敏感信息
          </p>
        </Dragger>
      </Modal>

      <Modal
        title="Tips"
        open={isModalDelete}
        onCancel={() => setIsModalDelete(false)}
        onOk={confirmDeleteAssetsData}
        okText="删除"
        cancelText="取消"
      >
        <p className="text-sm text-black">确定要删除这条数据吗?</p>
      </Modal>

      {/* add modal */}
      <Modal
        open={addItAssetsShow}
        title="添加IT设备"
        onCancel={() => setAddItAssetsShow(false)}
        onOk={onAddItAssets}
        okText="确认添加"
        cancelText="取消"
        afterClose={clearAssetsDataForm}
        maskClosable={false}
        width={1000}
      >
        <Divider />
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={20}>
            {/* product name */}
            <Col span={24}>
              <label htmlFor="Product" className='mb-1 flex items-center font-semibold'>
                <span className='mr-1 text-red-600 font-thin'>*</span>
                产品名称
              </label>
              <Input
                style={{ width: '100%' }}
                placeholder='产品名称'
                value={assetsDataForm.product_name}
                onChange={e => {
                  setAssetsDataForm({
                    ...assetsDataForm,
                    product_name: e.target.value,
                    value: e.target.value
                  })
                }}
              />
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={layoutWidth}>
              {/* product type */}
              <label
                htmlFor="产品类型"
                className='mb-1 flex items-center font-semibold'
              >
                <span className='mr-1 text-red-600 font-thin'>*</span>
                产品类型
              </label>
              <Select
                style={{ width: '100%' }}
                placeholder='产品类型'
                allowClear
                options={typeData}
                onChange={selectProductType}
                value={assetsDataForm.product_type}
              >
              </Select>
            </Col>

            {/* product brand */}
            {productBrandShow && (
              <Col span={layoutWidth}>
                <label
                  htmlFor="Brand"
                  className='mb-1 flex items-center font-semibold'
                >
                  <span className='mr-1 text-red-600 font-thin'>*</span>
                  产品品牌
                </label>
                <Select
                  style={{ width: '100%' }}
                  placeholder='产品品牌'
                  allowClear
                  onDropdownVisibleChange={onTriggerSelected}
                  value={assetsDataForm.product_brand}
                  onChange={assetsProductBrand}
                  options={typeDataBrand.map(item => {
                    return {
                      label:
                        <div className='flex'>
                          {selectOpen && <img src={item.logo_url} alt='avatar' className='mr-2 w-6' />}<span className='w-7 mt-0.5'>{item.value}</span>
                        </div>,
                      value: item.value
                    }
                  })}
                >
                </Select>
              </Col>
            )}

            <Col span={layoutWidth}>
              <label
                htmlFor="Type"
                className='mb-1 flex items-center font-semibold'
              >
                <span className='mr-1 text-red-600 font-thin'>*</span>
                产品数量
              </label>
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder='产品数量'
                value={assetsDataForm.product_number}
                onChange={e => {
                  setAssetsDataForm({
                    ...assetsDataForm,
                    product_number: Number(e)
                  })
                }}
              />
            </Col>

            <Col span={layoutWidth}>
              <label htmlFor="Price" className='mb-1 flex items-center font-semibold'>
                <span className='mr-1 text-red-600 font-thin'>*</span>
                产品总价 <i className='text-xs text-gray-500 not-italic ml-2'>(单价 * 数量)</i>
              </label>
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder='产品总价'
                addonAfter="CNY"
                value={assetsDataForm.product_price}
                onChange={e => {
                  setAssetsDataForm({
                    ...assetsDataForm,
                    product_price: Number(e)
                  })
                }}
              />
            </Col>
          </Row>

          <Row gutter={20}>
            {/* create time */}
            <Col span={12}>
              <label
                htmlFor="Create_Time"
                className='mb-1 flex items-center font-semibold'
              >
                <span className='mr-1 text-red-600  font-thin'>*</span>
                创建时间
              </label>
              <Input
                style={{ width: '100%' }}
                readOnly
                value={assetsDataForm.product_time}
              />
            </Col>
            <Col span={12}>
              <label
                htmlFor="Update_Time"
                className='mb-1 flex items-center font-semibold'
              >
                <span className='mr-1 text-red-600  font-thin'>*</span>
                更新时间
              </label>
              <Input
                style={{ width: '100%' }}
                readOnly
                value={assetsDataForm.product_update}
              />
            </Col>
          </Row>

          <Row gutter={15}>
            <Col span={24}>
              <label
                htmlFor="Problem"
                className='mb-1 flex items-center font-semibold'
              >
                备注
              </label>
              <Input.TextArea
                rows={5}
                autoSize={{ minRows: 5, maxRows: 5 }}
                placeholder='备注'
                maxLength={260}
                value={assetsDataForm.product_remark}
                onChange={e => {
                  setAssetsDataForm({
                    ...assetsDataForm,
                    product_remark: e.target.value
                  })
                }}
              />
            </Col>
          </Row>
        </Space>
        <Divider />
      </Modal>

      {/* edit modal */}
      <Modal
        title="编辑设备"
        open={isEditModalShow}
        onOk={onConfirmEditAssetsData}
        onCancel={() => setIsEditModalShow(false)}
        okText="确认编辑"
        cancelText="取消"
        afterClose={clearAssetsDataForm}
        maskClosable={false}
        width={1000}
      >
        <Divider />
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={15}>
            {/* product name */}
            <Col span={24}>
              <label htmlFor="Product" className='mb-1 flex items-center font-semibold'>
                <span className='mr-1 text-red-600 font-thin'>*</span>
                产品名称
              </label>
              <Input
                style={{ width: '100%' }}
                placeholder='产品名称'
                value={assetsDataForm.product_name}
                onChange={e => {
                  setAssetsDataForm({
                    ...assetsDataForm,
                    product_name: e.target.value,
                    value: e.target.value
                  })
                }}
              />
            </Col>
          </Row>
          <Row gutter={15}>
            <Col span={layoutWidth}>
              {/* product type */}
              <label
                htmlFor="Type"
                className='mb-1 flex items-center font-semibold'
              >
                <span className='mr-1 text-red-600 font-thin'>*</span>
                产品类型
              </label>
              <Select
                style={{ width: '100%' }}
                placeholder='产品类型'
                allowClear
                options={typeData}
                onChange={selectProductType}
                value={assetsDataForm.product_type}
              >
              </Select>
            </Col>

            {/* product brand */}
            {productBrandShow && (
              <Col span={layoutWidth}>
                <label
                  htmlFor="Brand"
                  className='mb-1 flex items-center font-semibold'
                >
                  <span className='mr-1 text-red-600 font-thin'>*</span>
                  产品品牌
                </label>
                <Select
                  style={{ width: '100%' }}
                  placeholder='产品品牌'
                  allowClear
                  onDropdownVisibleChange={onTriggerSelected}
                  value={assetsDataForm.product_brand}
                  onChange={assetsProductBrand}
                  options={typeDataBrand.map(item => {
                    return {
                      label:
                        <div className='flex'>
                          {selectOpen && <img src={item.logo_url} alt='avatar' className='mr-2 w-6' />}<span className='w-7 mt-0.5'>{item.value}</span>
                        </div>,
                      value: item.value
                    }
                  })}
                >
                </Select>
              </Col>
            )}

            <Col span={layoutWidth}>
              <label htmlFor="Price" className='mb-1 flex items-center font-semibold'>
                <span className='mr-1 text-red-600 font-thin'>*</span>
                产品数量
              </label>
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder='产品数量'
                addonAfter="USD"
                value={assetsDataForm.product_number}
                onChange={e => {
                  setAssetsDataForm({
                    ...assetsDataForm,
                    product_number: Number(e)
                  })
                }}
              />
            </Col>

            <Col span={layoutWidth}>
              <label htmlFor="Price" className='mb-1 flex items-center font-semibold'>
                <span className='mr-1 text-red-600 font-thin'>*</span>
                产品总价
              </label>
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder='产品总价'
                addonAfter="CNY"
                value={assetsDataForm.product_price}
                onChange={e => {
                  setAssetsDataForm({
                    ...assetsDataForm,
                    product_price: Number(e)
                  })
                }}
              />
            </Col>
          </Row>
          <Row gutter={15}>
            <Col span={12}>
              <label
                htmlFor="Create_"
                className='mb-1 flex items-center font-semibold'
              >
                <span className='mr-1 text-red-600  font-thin'>*</span>
                创建时间
              </label>
              <Input
                style={{ width: '100%' }}
                readOnly
                value={assetsDataForm.product_time}
              />
            </Col>
            <Col span={12}>
              <label
                htmlFor="Create_"
                className='mb-1 flex items-center font-semibold'
              >
                <span className='mr-1 text-red-600  font-thin'>*</span>
                更新时间
              </label>
              <Input
                style={{ width: '100%' }}
                readOnly
                value={assetsDataForm.product_update}
              />
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={24}>
              <label
                htmlFor="Problem"
                className='mb-1 flex items-center font-semibold'
              >
                备注
              </label>
              <Input.TextArea
                rows={5}
                autoSize={{ minRows: 5, maxRows: 5 }}
                placeholder='备注'
                maxLength={260}
                value={assetsDataForm.product_remark}
                onChange={e => {
                  setAssetsDataForm({
                    ...assetsDataForm,
                    product_remark: e.target.value
                  })
                }}
              />
            </Col>
          </Row>
        </Space>
        <Divider />
      </Modal>
    
      <Skeleton loading={isLoading} active paragraph={{rows: 10}}>
        <Row gutter={10}>
          <Col>
            <Button
              type='primary'
              onClick={modalAddDeviceHandler}
            >
              添加设备
            </Button>
          </Col>

          <Col>
            <Button
              type='primary'
              danger
              onClick={deleteAssetsDataIdHandler}
            >
              删除设备
            </Button>
          </Col>

          <Col>
            <Button
              color='cyan'
              variant="solid"
              onClick={() => setIsImportModalShow(true)}
            >
              导入设备
            </Button>
          </Col>
          <Col className='flex my-0 mr-0 ml-auto'>
            <Select
              className='w-40 mr-3'
              placeholder="设备类型"
              allowClear
              options={typeData}
              onChange={filterTypeDataText}
              value={filterTypeValue}
            />
            <DatePicker.RangePicker
              className='mr-3'
              format={'YYYY-MM-DD'}
              onChange={getTimeFilterData}
              locale={locale}
            />
            <Button
              type='primary'
              icon={<IoIosSearch />}
              onClick={searchFilterItAssetsData}
            >
            </Button>
          </Col>
        </Row>
        <div className='mt-5'>

          <Table
            className='[&_.ant-table-thead>tr>th]:!bg-[#f0f5ff]'
            rowSelection={{ ...rowSelection }}
            size='small'
            bordered
            columns={columns}
            dataSource={assetsData}
            scroll={{ x: '1300px' }}
            pagination={{
              position: ['bottomRight'],
              pageSizeOptions: ['10', '20', '50'],
              showSizeChanger: true,
              style: {
                marginBottom: '-5px'
              }
            }}
          />
        </div>
      </Skeleton>
    </div>
  )
}

export default WorkItAssetsTable