'use client'
import { useEffect, useState } from 'react'
import { Card, Tabs, Table, Button, Drawer, Descriptions, Tag, Row, Col, Input, InputNumber, Empty, Select, Skeleton, Spin, ConfigProvider } from 'antd'
import type { TabsProps } from 'antd'
import { productItem, inventoryItem, inspectionStatusItem, typeDataName } from '@/utils/dbType'
import { getItAssetsTabbleData } from '@/utils/providerItAssetsData'
import { getLoanOutTableData, insertLoanOutTableData, updateLoanOutTableData, deleteLoadoutTableData, searchInventoryTableData, searchLoanoutTableData } from '@/utils/providerLoanOut'
import { getWorkOrderType } from '@/utils/providerSelectData'
import dayjs from 'dayjs'
import useMessage from '@/utils/message'
import { getTimeNumber } from '@/utils/pubFunProvider'
import { IoIosSearch } from 'react-icons/io'

const Inventory = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loanoutSpin, setLoanoutSpin] = useState<boolean>(true)
  const [returnSpin, setReturnSpin] = useState<boolean>(true)

  const [searchTypeText, setSearchTypeText] = useState<string | null>(null)
  const [searchProductText, setSearchProductText] = useState<string | null>(null)
  const [searchProductName, setSearchProductName] = useState<inspectionStatusItem[]>([])
  const [searchTypeSelect, setSearchTypeSelect] = useState<typeDataName[]>([])

  const [searchLoanoutType, setSearchLoanoutType] = useState<string | null>(null)
  const [searchLoanoutProductText, setSearchLoanoutText] = useState<string | null>(null)
  const [searchLoanoutProdutcName, setSearchLoanoutProdutcName] = useState<inspectionStatusItem[]>([])

  const [loanOutTabKeys, setLoanOutTabKeys] = useState<string>('1')
  const [inventoryData, setInventoryData] = useState<productItem[]>([])
  const [loanOutData, setLoanOutData] = useState<inventoryItem[]>([])

  const [isShowDetails, setIsShowDetails] = useState(false)
  const [isShowReturn, setIsShowReturn] = useState(false)

  const [stockQuantity, setStockQuantity] = useState<number>(0)
  const [returnDeviceNum, setReturnDeviceNum] = useState<number>(0)
  const [loanoutForm, setLoanoutForm] = useState<inventoryItem>({
    id: '',
    loanout_id: getTimeNumber()[1],
    loanout_name: '',
    loanout_type: '',
    loanout_brand: '',
    loanout_number: 0,
    loanout_time: getTimeNumber()[0],
    loanout_user: '',
    loanout_remark: '',
    value: ''
  })

  const getInventoryData = () => {
    getItAssetsTabbleData().then(data => {
      // setInventoryData(data as productItem[])

      const sortedData = [...data!].sort((a, b) => {
        // 首先按照 product_type 排序
        if (a.product_type < b.product_type) return -1
        if (a.product_type > b.product_type) return 1
         
        return 0
      })

      setInventoryData(sortedData as productItem[])
      setIsLoading(false)

      setSearchProductName(data as inspectionStatusItem[])
    })
  }

  const getInventoryDetails = async (id: string) => {
    setIsShowDetails(true)

    const deviceData = await getItAssetsTabbleData(id)
    let totalQuantity = deviceData![0].product_number

    setLoanoutForm({
      ...loanoutForm,
      id: deviceData![0].id,
      loanout_name: deviceData![0].product_name,
      loanout_type: deviceData![0].product_type,
      loanout_brand: deviceData![0].product_brand,
      loanout_time: dayjs().format('MMM D, YYYY h:mm a'),
      value: deviceData![0].product_name
    })

    const loanOutData = await getLoanOutTableData(id)

    let sum = 0
    loanOutData!.forEach(item => {
      sum += item.loanout_number
    })
    let loanOutSum = sum

    let stoke = totalQuantity - loanOutSum
    setStockQuantity(stoke)

    setLoanoutSpin(false)
  }

  const switchTabChange = (key: string) => {
    setLoanOutTabKeys(key)
    setIsLoading(true)
    if (key === '2') {
      getLoanOutTableData().then(data => {
        const formatData = data?.map(item => ({
          ...item,
          loanout_time: dayjs(item.loanout_time).format('MMM D, YYYY h:mm a')
        }))
        setLoanOutData(formatData as inventoryItem[])
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }

  const clearloanoutDataForm = (type: number) => {
    type === 1 ? setIsShowDetails(false) : setIsShowReturn(false)
    setLoanoutForm({
      id: '',
      loanout_id: '',
      loanout_name: '',
      loanout_type: '',
      loanout_brand: '',
      loanout_number: 0,
      return_number: 0,
      loanout_time: '',
      loanout_user: '',
      loanout_remark: '',
      value: ''
    })
  }

  const returnLoanoutDevice = (item: any) => {
    setIsShowReturn(true)

    let returnDeviceNum = item.loanout_number
    setReturnDeviceNum(returnDeviceNum)

    setLoanoutForm({
      ...loanoutForm,
      id: item.id,
      loanout_id: item.loanout_id,
      loanout_name: item.loanout_name,
      loanout_type: item.loanout_type,
      loanout_brand: item.loanout_brand,
      loanout_number: 0,
      loanout_time: dayjs().format('MMM D, YYYY h:mm a'),
      loanout_user: item.loanout_user,
      loanout_remark: item.loanout_remark,
    })
    setReturnSpin(false)
  }

  const submitLoanoutDevice = () => {
    let { loanout_number, loanout_user } = loanoutForm
    if (loanout_number === 0 || loanout_number > stockQuantity) {
      useMessage(2, 'Loan out quantity is invalid', 'error')
      return
    } else if (loanout_user === '') {
      useMessage(2, 'Loan out user is invalid', 'error')
      return
    } else {
      insertLoanOutTableData(loanoutForm).then(data => {
        useMessage(2, 'Loan out device success', 'success')
        getLoanOutTableData().then(data => {
          const formatData = data?.map(item => ({
            ...item,
            loanout_time: dayjs().format('MMM D, YYYY h:mm a')
          }))
          setLoanOutData(formatData as inventoryItem[])
        })
        setIsShowDetails(false)
        clearloanoutDataForm(1)
        setLoanOutTabKeys('2')
      })
    }
  }

  const getLoanoutProductName = async () => {
    getLoanOutTableData().then(data => {
      const formatData = data?.map(item => ({
        ...item,
        value: item.loanout_name
      }))
      setSearchLoanoutProdutcName(formatData as inspectionStatusItem[])
    })
  }

  const returnDeviceLoanoutEvent = () => {
    const { loanout_number, loanout_id } = loanoutForm
    if (loanout_number === 0 || loanout_number > returnDeviceNum) {
      useMessage(2, 'Return quantity is invalid', 'error')
      return
    } else {
      let returnComputed = returnDeviceNum - loanout_number
      if (returnComputed > 0) {
        updateLoanOutTableData(loanoutForm).then(data => {
          useMessage(2, 'Return device success!', 'success')
          getLoanOutTableData().then(data => {
            const formatData = data?.map(item => ({
              ...item,
              loanout_time: dayjs().format('MMM D, YYYY h:mm a')
            }))
            setLoanOutData(formatData as inventoryItem[])
          })
          setIsShowReturn(false)
        })
      } else if (returnComputed === 0) {
        deleteLoadoutTableData(loanout_id).then(data => {
          getLoanOutTableData().then(data => {
            const formatData = data?.map(item => ({
              ...item,
              loanout_time: dayjs().format('MMM D, YYYY h:mm a')
            }))
            setLoanOutData(formatData as inventoryItem[])
          })
          setIsShowReturn(false)
          clearloanoutDataForm(2)
          useMessage(2, 'Return device success!', 'success')
        })
      } else {
        useMessage(2, 'Return quantity is invalid', 'error')
        return
      }
    }
  }

  const searchFilterTableData = () => {
    searchInventoryTableData(searchTypeText, searchProductText).then(data => {
      getItAssetsTabbleData().then(() => {
        setInventoryData(data as productItem[])
      })
    })
  }

  const searchLoanoutFilterTableData = () => {
    searchLoanoutTableData(searchLoanoutType, searchLoanoutProductText).then(data => {
      getLoanOutTableData().then(() => {
        const formatData = data?.map(item => ({
          ...item,
          loanout_time: dayjs().format('MMM D, YYYY h:mm a')
        }))
        setLoanOutData(formatData as inventoryItem[])
      })
    })
  }

  const createQrCodePage = (id: string) => {
    window.open(`/TemplateCode?id=${id}`, '_blank')
  }

  const inventoryColumns = [{
    title: '编号',
    key: 'no',
    render: (_: any, __: any, index: number) => (
      <div>{index + 1}</div>
    ),
  }, {
    title: '类型',
    dataIndex: 'product_type',
    key: 'product_type',
  }, {
    title: '品牌',
    dataIndex: 'product_brand',
    key: 'product_brand',
  }, {
    title: '设备名称',
    dataIndex: 'product_name',
    key: 'product_name',
  }, {
    title: '总数量',
    dataIndex: 'product_number',
    key: 'product_number',
  }, {
    title: '备注',
    dataIndex: 'inventory_remark',
    key: 'inventory_remark',
  }, {
    title: '其它',
    key: 'others',
    render: (item: any) => (
      <div>
        <Button
          size='small'
          type='primary'
          className='mr-2 text-xs'
          onClick={() => getInventoryDetails(item.id)}
        >
          loan out
        </Button>
        {/* <Button size='small' className='bg-green-500 text-xs'>QR Code</Button> */}
      </div>
    )
  }]

  const loanOutColumns = [{
    title: '编号',
    key: 'no',
    render: (_: any, __: any, index: number) => (
      <div>{index + 1}</div>
    ),
  }, {
    title: '类型',
    dataIndex: 'loanout_type',
    key: 'loanout_type',
  }, {
    title: '品牌',
    dataIndex: 'loanout_brand',
    key: 'loanout_brand',
  }, {
    title: '设备名称',
    dataIndex: 'loanout_name',
    key: 'loanout_name',
  }, {
    title: '借出数量',
    dataIndex: 'loanout_number',
    key: 'loanout_number',
  }, {
    title: '借出时间',
    dataIndex: 'loanout_time',
    key: 'loanout_time',
  }, {
    title: '借出人',
    dataIndex: 'loanout_user',
    key: 'loanout_user',
  }, {
    title: '备注',
    dataIndex: 'loanout_remark',
    key: 'loanout_remark',
  }, {
    title: '其它',
    key: 'others',
    render: (item: any) => (
      <div>
        <Button
          onClick={() => returnLoanoutDevice(item)}
          size='small'
          className='bg-green-500 
          text-xs 
          text-white
          border
          border-green-500'
        >
          归还
        </Button>
        <Button
          size='small'
          type='primary'
          className='text-xs ml-2'
          onClick={() => createQrCodePage(item.id)}
        >
          二维码
        </Button>
      </div>
    )
  }]

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '设备库存',
      children:
        <div>
          <div className='mb-4 flex'>
            <div className='ml-auto'>
              <Select
                className='w-[160px] mr-2'
                placeholder="选择类型"
                options={searchTypeSelect}
                allowClear
                value={searchTypeText}
                onChange={e => setSearchTypeText(e)}
              >
              </Select>
              <Select
                className='w-[220px] mr-2'
                placeholder='选择设备'
                options={searchProductName}
                allowClear
                showSearch
                value={searchProductText}
                onChange={e => setSearchProductText(e)}
              >
              </Select>
              <Button
                type='primary'
                icon={<IoIosSearch />}
                onClick={searchFilterTableData}
              >
              </Button>
            </div>
          </div>
          <Table
            columns={inventoryColumns}
            dataSource={inventoryData}
            size='middle'
            bordered
            className='[&_.ant-table-thead>tr>th]:!bg-[#f0f5ff]'
            pagination={{
              position: ['bottomRight'],
              pageSizeOptions: ['10', '20', '50'],
              showSizeChanger: true,
              style: {
                marginBottom: '-5px'
              }
            }}
          />
          <Drawer
            title="Loan Out"
            open={isShowDetails}
            onClose={() => clearloanoutDataForm(1)}
            maskClosable={false}
          >
            <ConfigProvider theme={{
              components: {
                Spin: {contentHeight: '100%'}
              }
            }}>
              <Spin spinning={loanoutSpin} tip='Loading...' className='bg-white'>
                <div className='w-full'>
                  <Descriptions column={24}>
                    <Descriptions.Item span={12} label="Stock quantity">
                      <div>{stockQuantity}</div>
                    </Descriptions.Item>
                    <Descriptions.Item span={12} label="Status">
                      {stockQuantity > 0 ? <Tag color='green'>In stock</Tag> : <Tag color='red'>Out of stock</Tag>}
                    </Descriptions.Item>
                  </Descriptions>
                  {stockQuantity > 0 ? (
                    <>
                      <Row gutter={15} className='mt-4'>
                        <Col span={24} className='mb-3'>
                          <label className='flex mb-1' htmlFor="Product Name">
                            Product Name
                          </label>
                          <Input value={loanoutForm.loanout_name} readOnly />
                        </Col>
                        <Col span={24} className='mb-3'>
                          <label className='flex mb-1' htmlFor="Product Type">
                            Product Type
                          </label>
                          <Input value={loanoutForm.loanout_type} readOnly />
                        </Col>
                        <Col span={24} className='mb-3'>
                          <label className='flex mb-1' htmlFor="Product Type">
                            Product Brand
                          </label>
                          <Input placeholder="Product Brand" readOnly value={loanoutForm.loanout_brand} />
                        </Col>
                        <Col span={24} className='mb-3'>
                          <label className='flex mb-1' htmlFor="Loan Out Quantity">
                            Loan Out Time
                          </label>
                          <Input placeholder="Loan Out Time" readOnly value={loanoutForm.loanout_time} />
                        </Col>
                        <Col span={24} className='mb-3'>
                          <label className='flex mb-1' htmlFor="Loan Out Quantity">
                            <span className='text-red-500 text-sx mNumber mr-1'>*</span>
                            Loan Out Quantity
                          </label>
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            placeholder="Number"
                            value={loanoutForm.loanout_number}
                            addonAfter={'<=' + stockQuantity}
                            onChange={value => setLoanoutForm({ ...loanoutForm, loanout_number: value ?? 0 })}
                          />
                        </Col>
                        <Col span={24} className='mb-3'>
                          <label className='flex mb-1' htmlFor="Loan Out Quantity">
                            <span className='text-red-500 text-sx mr-1'>*</span>
                            Loan Out User
                          </label>
                          <Input
                            placeholder="username"
                            value={loanoutForm.loanout_user}
                            onChange={e => setLoanoutForm({ ...loanoutForm, loanout_user: e.target.value })}
                          />
                        </Col>
                        <Col span={24} className='mt-3'>
                          <Input.TextArea
                            placeholder='Remark'
                            showCount
                            rows={5}
                            autoSize={{ minRows: 5, maxRows: 5 }}
                            maxLength={100}
                          />
                        </Col>
                      </Row>
                      <div className='flex mt-6'>
                        <Button className='mr-4' onClick={() => setIsShowDetails(false)}>Cancel</Button>
                        <Button type='primary' onClick={submitLoanoutDevice}>Confirm</Button>
                      </div>
                    </>
                  ) : (
                    <div className='flex justify-center mt-16 flex-col'>
                      <Empty description='Low Inventory' />
                    </div>
                  )}
                </div>
              </Spin>
            </ConfigProvider>
          </Drawer>
        </div>
    },
    {
      key: '2',
      label: '设备借出',
      children:
        <div>
          <div className='mb-4 flex'>
            <div className='ml-auto'>
              <Select
                className='w-[160px] mr-2'
                placeholder="选择类型"
                options={searchTypeSelect}
                allowClear
                value={searchLoanoutType}
                onChange={e => setSearchLoanoutType(e)}
              >
              </Select>
              <Select
                className='w-[220px] mr-2'
                placeholder='选择设备'
                options={searchLoanoutProdutcName}
                allowClear
                showSearch
                value={searchLoanoutProductText}
                onChange={e => setSearchLoanoutText(e)}
                onFocus={getLoanoutProductName}
              >
              </Select>
              <Button
                type='primary'
                icon={<IoIosSearch />}
                onClick={searchLoanoutFilterTableData}
              >
              </Button>
            </div>
          </div>
          <Table
            columns={loanOutColumns}
            dataSource={loanOutData}
            size='middle'
            bordered
            className='[&_.ant-table-thead>tr>th]:!bg-[#f0f5ff] [&_.ant-pagination]: my-0'
            pagination={{
              position: ['bottomRight'],
              pageSizeOptions: ['10', '20', '50'],
              showSizeChanger: true,
              style: {
                marginBottom: '-5px'
              }
            }}
          />
          {/* return device */}
          <Drawer
            title="Return Device"
            open={isShowReturn}
            onClose={() => clearloanoutDataForm(2)}
            maskClosable={false}
          >
            <ConfigProvider theme={{
              components: {
                Spin: {contentHeight: '100%'}
              }
            }}>
              <Spin spinning={returnSpin} tip='Loading...' className='bg-white'>
                <div className='w-full'>
                  <Row gutter={15}>
                    <Col span={24} className='mb-3'>
                      <label className='flex mb-1' htmlFor="Product Name">
                        Product Name
                      </label>
                      <Input value={loanoutForm.loanout_name} readOnly />
                    </Col>
                    <Col span={24} className='mb-3'>
                      <label className='flex mb-1' htmlFor="Product Type">
                        Product Type
                      </label>
                      <Input value={loanoutForm.loanout_type} readOnly />
                    </Col>
                    <Col span={24} className='mb-3'>
                      <label className='flex mb-1' htmlFor="Product Type">
                        Product Brand
                      </label>
                      <Input placeholder="Product Brand" readOnly value={loanoutForm.loanout_brand} />
                    </Col>
                    <Col span={24} className='mb-3'>
                      <label className='flex mb-1' htmlFor="Loan Out Quantity">
                        Loan Out Time
                      </label>
                      <Input placeholder="Loan Out Time" readOnly value={loanoutForm.loanout_time} />
                    </Col>
                    <Col span={24} className='mb-3'>
                      <label className='flex mb-1' htmlFor="Loan Out Quantity">
                        <span className='text-red-500 text-sx mNumber mr-1'>*</span>
                        Loan Out Quantity
                      </label>
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        placeholder="Number"
                        value={loanoutForm.loanout_number}
                        addonAfter={'<=' + returnDeviceNum}
                        onChange={value => setLoanoutForm({ ...loanoutForm, loanout_number: value ?? 0 })}
                      />
                    </Col>
                    <Col span={24} className='mb-3'>
                      <label className='flex mb-1' htmlFor="Loan Out Quantity">
                        <span className='text-red-500 text-sx mr-1'>*</span>
                        Loan Out User
                      </label>
                      <Input
                        placeholder="username"
                        value={loanoutForm.loanout_user}
                        onChange={e => setLoanoutForm({ ...loanoutForm, loanout_user: e.target.value })}
                        readOnly
                      />
                    </Col>
                    <Col span={24} className='mt-3'>
                      <Input.TextArea
                        placeholder='Remark'
                        showCount
                        rows={5}
                        autoSize={{ minRows: 5, maxRows: 5 }}
                        maxLength={100}
                      />
                    </Col>
                  </Row>
                </div>
                <div className='flex mt-6'>
                  <Button className='mr-4' onClick={() => setIsShowReturn(false)}>Cancel</Button>
                  <Button type='primary' onClick={returnDeviceLoanoutEvent}>Return</Button>
                </div>
              </Spin>
            </ConfigProvider>
          </Drawer>
        </div>
    }
  ]

  const getInventoryTypeData = () => {
    getWorkOrderType().then(data => {
      setSearchTypeSelect(data as typeDataName[])
    })
  }

  useEffect(() => {
    getInventoryData()
    getInventoryTypeData()
    document.title = 'Inventory Management'
  }, [])

  return (
    <div className='p-3 w-full box-border'>
      <Card title="设备库存管理">
        <Skeleton loading={isLoading} active paragraph={{ rows: 10 }}>
          <Tabs
            activeKey={loanOutTabKeys}
            items={items}
            onChange={switchTabChange}
            className='-mt-2'
          />
        </Skeleton>
      </Card>
    </div>
  )
}

export default Inventory