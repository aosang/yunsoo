'use client'
import { useState, useEffect } from "react"
import { Collapse, Space, Card, Row, Col, Button, Modal, Input, Divider, Table, Badge, Select, Empty, Result, Skeleton, DatePicker } from "antd"
import { SearchOutlined, DownloadOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons'
import { IoIosSearch } from 'react-icons/io'
import { getInspectionStatusData, insertInspectionDeviceData, getInspectionDeviceData, deleteInspectionDevice, getInspectionDetailsDeviceData, searchFilterInspectionData } from '@/utils/providerInspection'
import { inspectionStatusItem, inspectionForms, inspectionItem, selectInspectionItem } from '@/utils/dbType'
import { getTimeNumber, getDeviceData } from '@/utils/pubFunProvider'
import { getProfiles, getUser } from '@/utils/providerSelectData'
import useMessage from '@/utils/message'
import dayjs from 'dayjs'

import locale from 'antd/es/date-picker/locale/zh_CN'
dayjs.locale('zh-cn')

type inspectionStatusProps = inspectionStatusItem[]

const Inspection: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalDelete, setIsModalDelete] = useState<boolean>(false)
  const [deleteInspectionId, setDeleteInspectionId] = useState<string>('')
  const [deviceRecordListData, setDeviceRecordListData] = useState<inspectionForms[]>([])
  const [isDetailsShow, setIsDetailsShow] = useState(false)
  const [isAccordion] = useState<boolean>(false)
  const [createInspectionModal, setCreateInspectionModal] = useState<boolean>(false)
  const [selectAssetsData, setSelectAssetsData] = useState<selectInspectionItem[]>([])
  const [inspectionDataStatus, setInspectionDataStatus] = useState<inspectionStatusProps>([])
  const [inspectionFilterStatus, setInspectionFilterStatus] = useState<inspectionStatusProps>([])
  const [problemNumberIsDisable, setProblemNumberIsDisable] = useState<boolean>(false)

  const [inspectionSelectStatus, setInspectionSelectStatus] = useState<string>('')
  const [inspectionSelectStartTime, setInspectionSelectStartTime] = useState<string>('')
  const [inspectionSelectEndTime, setInspectionSelectEndTime] = useState<string>('')

  const [inspectionDataForm, setInspectionDataForm] = useState<inspectionForms>({
    inspection_id: '',
    inspection_time: '',
    inspection_number: 0,
    inspection_phone: '',
    inspection_name: '',
    inspection_email: '',
    inspection_status: null,
    inspection_deviceData: [],
  })
  const [inspectionItemForm, setInspectionItemForm] = useState<inspectionItem>({
    inspection_id: '',
    inspection_device: null,
    inspection_description: '',
    key: getTimeNumber()[1],
  })

  const columns = [{
    title: '设备名称',
    dataIndex: 'inspection_device',
    key: 'inspection_device',
  }, {
    title: '问题描述',
    dataIndex: 'inspection_description',
    key: 'inspection_description',
  }]

  const onRowData = {
    onClick: (record: inspectionItem) => {
      setInspectionDataForm({
        ...inspectionDataForm,
        inspection_deviceData: inspectionDataForm.inspection_deviceData!.filter(item => {
          return item.inspection_id !== record.inspection_id
        })
      })
    }
  }

  const createInspectionModalHandler = () => {
    setCreateInspectionModal(true)
    getInspectionStatusData().then((res) => {
      setInspectionDataStatus(res as inspectionStatusProps)
    })
    setInspectionDataForm({
      ...inspectionDataForm,
      inspection_time: getTimeNumber()[0]
    })

    getUser()
      .then((res) => {
        getProfiles(res?.user!.id as string)
          .then(res => {
            setInspectionDataForm({
              ...inspectionDataForm,
              inspection_time: getTimeNumber()[0],
              inspection_email: res![0].email || '',
              inspection_name: res![0].username || ''
            })
          })
      })
  }

  const selectInspectionStatusData = (e: any) => {
    setInspectionDataForm({
      ...inspectionDataForm,
      inspection_status: e
    })

    if (e === '发现问题') {
      setProblemNumberIsDisable(false)
      getDeviceData(e)
        .then(res => {
          setSelectAssetsData(res as selectInspectionItem[])
        })
    } else {
      setProblemNumberIsDisable(true)
    }
  }

  const selectInspectionDeviceName = (e: any) => {
    setInspectionItemForm({
      ...inspectionItemForm,
      inspection_id: getTimeNumber()[1],
      inspection_device: e
    })
  }

  const addProblemDeviceDescription = (e: any) => {
    setInspectionItemForm({
      ...inspectionItemForm,
      inspection_id: getTimeNumber()[1],
      inspection_description: e.target.value
    })
  }

  const confirmProblemDeviceName = () => {
    const { inspection_device, inspection_description } = inspectionItemForm
    if (!inspection_device) {
      useMessage(2, '请选择问题设备', 'error')
    } else if (!inspection_description) {
      useMessage(2, '请输入问题描述', 'error')
    } else {
      setInspectionDataForm({
        ...inspectionDataForm,
        inspection_deviceData: [...inspectionDataForm.inspection_deviceData!, inspectionItemForm]
      })

      setInspectionItemForm({
        ...inspectionItemForm,
        key: '',
        inspection_description: '',
        inspection_device: null
      })
    }
  }

  const insertInspectionRecordData = () => {
    const { inspection_status, inspection_phone, inspection_number, inspection_deviceData } = inspectionDataForm
    if (!inspection_status) {
      useMessage(2, '请选择巡检状态', 'error')
    } else if (!inspection_phone) {
      useMessage(2, '请输入手机号码', 'error')
    } else {
      if (inspection_status === '发现问题') {
        if (inspection_number === 0) {
          useMessage(2, '请输入问题设备数量', 'error')
        } else if (inspection_number !== inspection_deviceData?.length) {
          useMessage(2, '问题设备数量与问题设备数量不一致', 'error')
        } else {
          setCreateInspectionModal(false)
          insertInspectionDeviceData(inspectionDataForm)
            .then(() => {
              getInspectionRecordListData()
            })
        }
      } else {
        setCreateInspectionModal(false)
        insertInspectionDeviceData(inspectionDataForm)
          .then(() => {
            getInspectionRecordListData()
          })
      }
    }
  }

  const closeInspectionModal = () => {
    setInspectionDataForm({
      ...inspectionDataForm,
      inspection_status: null,
      inspection_deviceData: [],
      inspection_phone: '',
      inspection_number: 0,
    })
    setInspectionItemForm({
      ...inspectionItemForm,
      inspection_id: '',
      inspection_device: null,
      inspection_description: '',
    })
  }

  const getInspectionRecordListData = () => {
    getUser().then(res => {
      getInspectionDeviceData(res?.user!.id as string)
        .then(res => {
          if (res) {
            setDeviceRecordListData(res as inspectionForms[])
          }
          setIsLoading(false)
        })
    })
  }

  const onDeleteInspection = (id: string) => {
    setIsModalDelete(true)
    setDeleteInspectionId(id)
  }

  const confirmDeleteAssetsData = () => {
    setIsModalDelete(false)
    deleteInspectionDevice(deleteInspectionId)
      .then(() => {
        getInspectionRecordListData()
      })
  }

  const getInspectionDetailsData = (inspectionId: string) => {
    setIsDetailsShow(true)
    getInspectionDetailsDeviceData(inspectionId)
      .then(res => {
        setInspectionDataForm({
          ...inspectionDataForm,
          inspection_time: res![0].inspection_time,
          inspection_name: res![0].inspection_name,
          inspection_phone: res![0].inspection_phone,
          inspection_number: res![0].inspection_number,
          inspection_status: res![0].inspection_status,
          inspection_email: res![0].inspection_email,
          inspection_deviceData: res![0].inspection_deviceData,
        })
      })
  }

  // close details and clear cache data
  const clearAllDeivceDataForm = () => {
    setInspectionDataForm({
      ...inspectionDataForm,
      inspection_status: null,
      inspection_deviceData: [],
      inspection_phone: '',
      inspection_number: 0,
    })
  }

  const saveInspectionFile = (inspectionId: string) => {
    getInspectionDetailsDeviceData(inspectionId)
      .then(res => {
        window.sessionStorage.setItem('inspectionData', JSON.stringify(res))
        window.open('https://www.wangle.run/assetsmanager/InspectionFile', '_blank')
      })
  }

  const getTypeStatusData = () => {
    getInspectionStatusData()
      .then(res => {
        setInspectionFilterStatus(res as inspectionStatusProps)
      })
  }

  const filterInspectionData = (e: any) => {
    setInspectionSelectStatus(e)
  }

  const filterInspectionTimeData = (dateString: any) => {
    let startTime = dateString ? dateString[0].$d : ''
    let endTime = dateString ? dateString[1].$d : ''
    startTime = startTime ? dayjs(startTime).format('YYYY-MM-DD') : ''
    endTime = endTime ? dayjs(endTime).format('YYYY-MM-DD') : ''
    setInspectionSelectStartTime(startTime)
    setInspectionSelectEndTime(endTime)
  }

  const searchFilterInspectionDataEvent = () => {
    getUser().then(res => {
      searchFilterInspectionData(res!.user!.id, inspectionSelectStatus, inspectionSelectStartTime, inspectionSelectEndTime)
        .then(res => {
          if (res) {
            setDeviceRecordListData(res as inspectionForms[])
          }
          setIsLoading(false)
        })
    })
  }

  useEffect(() => {
    getInspectionRecordListData()
    getTypeStatusData()

    document.title = '巡检记录'
  }, [])

  const addColumns = [{
    title: '设备名称',
    dataIndex: 'inspection_device',
    key: 'inspection_device',
  }, {
    title: '问题描述',
    dataIndex: 'inspection_description',
    key: 'inspection_description',
  }, {
    title: 'Other',
    width: 80,
    render: (record: inspectionItem) => {
      return (
        <Button
          variant="filled"
          color="danger"
          icon={<DeleteOutlined />}
          onClick={() => onRowData.onClick(record)}
        >
        </Button>
      )
    }
  }]

  return (
    <>
      <div className="w-full p-3 box-border">
        <Space direction="vertical" size={16} className="w-full">
          <Card title="巡检记录" style={{ background: '#f0f2f5'}}>
            <Skeleton active loading={isLoading}>
              <div className="flex" style={{ marginTop: '-10px' }}>
                <Button
                  type="primary"
                  className="mb-4"
                  onClick={createInspectionModalHandler}
                >
                  新增记录
                </Button>
                <div className="ml-auto">
                  <Select
                    className="w-[200px] mr-3"
                    placeholder="巡检状态"
                    options={inspectionFilterStatus}
                    onChange={filterInspectionData}
                    allowClear
                  >
                  </Select>
                  <DatePicker.RangePicker
                    className="mr-3"
                    format={'YYYY-MM-DD'}
                    onChange={filterInspectionTimeData}
                    locale={locale}
                  />
                  <Button
                    type='primary'
                    icon={<IoIosSearch />}
                    onClick={searchFilterInspectionDataEvent}
                  >
                  </Button>
                </div>
              </div>
              <>
                <Divider className="my-3 mx-0" />
                {deviceRecordListData.length > 0 ? (
                  <>
                    <Row gutter={20} className="mt-6">
                      {deviceRecordListData.map(item => {
                        return (
                          <Col span={6} key={item.inspection_id} className="mb-5">
                            <Card className="relative">
                              <Row className="mb-2">
                                <Col span={24}><span className="text-sm">巡检时间：{item.inspection_time}</span></Col>
                              </Row>
                              <Row className="mb-2">
                                <Col span={24}><span className="text-sm">巡检状态：{item.inspection_status}</span></Col>
                              </Row>
                              <Row className="mb-2">
                                <Col span={12}><span className="text-sm">巡检员：{item.inspection_name}</span></Col>
                                <Col span={12}><span className="text-sm">手机号码：{item.inspection_phone}</span></Col>
                              </Row>
                              <Row className="mb-2">
                                <Col span={24}><span className="text-sm">电子邮箱：{item.inspection_email}</span></Col>
                              </Row>
                              {
                                Number(item.inspection_number) === 0 ? (
                                  <div className="w-7 h-7 bg-green-500 rounded-full absolute top-5 right-5">
                                    <CheckOutlined className="text-center text-white block leading-7 font-bold" />
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 bg-red-400 rounded-full absolute top-5 right-5">
                                    <span className="text-center text-white block leading-7">{item.inspection_number}</span>
                                  </div>
                                )
                              }

                              <div className="mt-4">
                                <Button
                                  color="primary"
                                  size="small"
                                  icon={<SearchOutlined />}
                                  variant="filled"
                                  className="mr-3"
                                  onClick={() => getInspectionDetailsData(item.inspection_id)}
                                >
                                  详情
                                </Button>

                                <Button
                                  className="bg-green-100 text-green-500 border-green-100 mr-3"
                                  size="small"
                                  icon={<DownloadOutlined />}
                                  onClick={() => saveInspectionFile(item.inspection_id)}
                                >
                                  下载
                                </Button>

                                <Button
                                  color="danger"
                                  size="small"
                                  variant="filled"
                                  icon={<DeleteOutlined />}
                                  onClick={() => onDeleteInspection(item.inspection_id)}
                                >
                                  删除
                                </Button>
                              </div>
                            </Card>
                          </Col>
                        )
                      })}
                    </Row>
                  </>
                ) : (
                  <div className="mt-16">
                    <Empty description="请创建巡检记录">
                      <Button type="primary" onClick={createInspectionModalHandler}>立即创建</Button>
                    </Empty>
                  </div>
                )}
              </>
            </Skeleton>
          </Card>
        </Space>

        {/* details */}
        <Modal
          open={isDetailsShow}
          onCancel={() => setIsDetailsShow(false)}
          title="Inspection Details"
          maskClosable={false}
          width={1260}
          afterClose={clearAllDeivceDataForm}
          footer={null}
        >
          <Divider />
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Row gutter={20}>
              <Col span={8}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="InspectionTime"
                >
                  巡检时间
                </label>
                <Input value={inspectionDataForm.inspection_time} readOnly />
              </Col>
              <Col span={8}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="Inspector"
                >
                  巡检员
                </label>
                <Input value={inspectionDataForm.inspection_name} readOnly />
              </Col>
              <Col span={8}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="InspectionStatus"
                >
                  巡检状态
                </label>
                <Input value={inspectionDataForm.inspection_status as string} readOnly />
              </Col>
            </Row>

            <Row gutter={20}>
              <Col span={12}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="PhoneNumber"
                >
                  手机号码
                </label>
                <Input value={inspectionDataForm.inspection_phone} readOnly />
              </Col>

              <Col span={12}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="email"
                >
                  电子邮箱
                </label>
                <Input value={inspectionDataForm.inspection_email} readOnly />
              </Col>
            </Row>
          </Space>
          {
            Number(inspectionDataForm.inspection_number) === 0? (
              <Card className="mt-6">
                <Result
                  status={'success'}
                  title="所有设备均正常"
                  subTitle="本次巡检未发现异常。"
                />
              </Card>
            ) : (
              <Collapse
                defaultActiveKey={['1']}
                accordion={isAccordion}
                className="mt-5"
                size="small"
                items={
                  [{
                    key: '1',
                    label: (
                      <div className="flex">
                        <span className="mr-3">问题设备</span>
                        <Badge count={inspectionDataForm.inspection_number} />
                      </div>
                    ),
                    children:
                      <Table
                        columns={columns}
                        dataSource={inspectionDataForm.inspection_deviceData}
                        size="small"
                        pagination={false}
                        bordered
                      >
                      </Table>
                  }]
                }>
              </Collapse>
            )
          }
          <Divider />
        </Modal>

        {/* add */}
        <Modal
          width={1260}
          open={createInspectionModal}
          title="创建巡检记录"
          onCancel={() => setCreateInspectionModal(false)}
          onOk={insertInspectionRecordData}
          maskClosable={false}
          afterClose={closeInspectionModal}
        >
          <Divider />
          <Space direction="vertical" size={16} className="w-full">
            <Row gutter={20}>
              <Col span={8}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="InspectionTime"
                >
                  <span className="mr-1 text-red-600 font-thin">*</span>
                  巡检时间
                </label>
                <Input value={inspectionDataForm.inspection_time} readOnly />
              </Col>
              <Col span={8}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="Inspector"
                >
                  <span className="mr-1 text-red-600 font-thin">*</span>
                  巡检员
                </label>
                <Input value={inspectionDataForm.inspection_name} readOnly />
              </Col>
              <Col span={8}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="Email"
                >
                  <span className="mr-1 text-red-600 font-thin">*</span>
                  电子邮箱
                </label>
                <Input value={inspectionDataForm.inspection_email} readOnly />
              </Col>
            </Row>

            <Row gutter={20}>
              <Col span={8}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="InspectionStatus"
                >
                  <span className="mr-1 text-red-600 font-thin">*</span>
                  是否发现问题？
                </label>
                <Select
                  options={inspectionDataStatus}
                  style={{ width: '100%' }}
                  value={inspectionDataForm.inspection_status}
                  placeholder="请选择"
                  onChange={selectInspectionStatusData}
                >
                </Select>
              </Col>
              <Col span={8}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="InspectionNumber"
                >
                  <span className="mr-1 text-red-600 font-thin">*</span>
                  问题设备数量
                </label>
                <Input
                  disabled={problemNumberIsDisable}
                  type="number"
                  value={inspectionDataForm.inspection_number}
                  onChange={(e) => setInspectionDataForm({
                    ...inspectionDataForm,
                    inspection_number: Number(e.target.value)
                  })} />
              </Col>
              <Col span={8}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="Phone"
                >
                  <span className="mr-1 text-red-600 font-thin">*</span>
                  手机号码
                </label>
                <Input
                  placeholder="输入手机号"
                  value={inspectionDataForm.inspection_phone}
                  onChange={(e) => setInspectionDataForm({
                    ...inspectionDataForm,
                    inspection_phone: e.target.value
                  })}
                />
              </Col>
            </Row>

            {inspectionDataForm.inspection_status === '所有设备均正常' && (
              <Card className="mt-6">
                <Result
                  status={'success'}
                  title="所有设备均正常"
                  subTitle="本次巡检未发现异常。"
                />
              </Card>
            )}

            {inspectionDataForm.inspection_status === '发现问题' && (
              <>
                <Row gutter={20} className="mt-3">
                  <Col span={24}>
                    <Table
                      bordered
                      columns={addColumns}
                      dataSource={inspectionDataForm.inspection_deviceData}
                      size='small'
                    >
                    </Table>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={4}>
                    <Select
                      showSearch
                      style={{ width: '100%' }}
                      value={inspectionItemForm.inspection_device}
                      options={selectAssetsData}
                      placeholder="选择问题设备"
                      onChange={selectInspectionDeviceName}
                      allowClear
                    />

                  </Col>
                  <Col span={18}>
                    <Input.TextArea
                      autoSize
                      placeholder="简单描述一下问题设备"
                      showCount
                      maxLength={150}
                      onChange={addProblemDeviceDescription}
                      allowClear
                      value={inspectionItemForm.inspection_description}
                    >
                    </Input.TextArea>
                  </Col>
                  <Col span={2}>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={confirmProblemDeviceName}>
                    </Button>
                  </Col>
                </Row>
              </>
            )}
          </Space>
          <Divider />
        </Modal>

        <Modal
          title="提示"
          open={isModalDelete}
          onCancel={() => setIsModalDelete(false)}
          onOk={confirmDeleteAssetsData}
        >
          <p className="text-sm text-black">确定要删除这条数据吗？</p>
        </Modal>
      </div>
    </>
  )
}

export default Inspection