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
    title: 'Device Name',
    dataIndex: 'inspection_device',
    key: 'inspection_device',
  }, {
    title: 'Problem Description',
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

    if (e === 'Discovered problem') {
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
      useMessage(2, 'Please enter the problem device', 'error')
    } else if (!inspection_description) {
      useMessage(2, 'Please enter the problem description', 'error')
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
      useMessage(2, 'Please select the status', 'error')
    } else if (!inspection_phone) {
      useMessage(2, 'Please enter phone number', 'error')
    } else {
      if (inspection_status === 'Discovered problem') {
        if (inspection_number === 0) {
          useMessage(2, 'Please enter the number of problem devices', 'error')
        } else if (inspection_number !== inspection_deviceData?.length) {
          useMessage(2, 'The number of problem devices is not equal to the number of problem devices', 'error')
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
        window.open('/InspectionFile', '_blank')
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
    startTime = startTime ? dayjs(startTime).format('MMM D, YYYY h:mm a') : ''
    endTime = endTime ? dayjs(endTime).format('MMM D, YYYY h:mm a') : ''
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

    document.title = 'Inspection'
  }, [])

  const addColumns = [{
    title: 'Device Name',
    dataIndex: 'inspection_device',
    key: 'inspection_device',
  }, {
    title: 'Problem Description',
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
          <Card title="Inspection Record" style={{ background: '#f0f2f5' }}>
            <Skeleton active loading={isLoading}>
              <div className="flex">
                <Button
                  type="primary"
                  className="mb-4"
                  onClick={createInspectionModalHandler}
                >
                  Create
                </Button>
                <div className="ml-auto">
                  <Select
                    className="w-[200px] mr-3"
                    placeholder="Type"
                    options={inspectionFilterStatus}
                    onChange={filterInspectionData}
                    allowClear
                  >
                  </Select>
                  <DatePicker.RangePicker
                    className="mr-3"
                    format={'YYYY-MM-DD'}
                    onChange={filterInspectionTimeData}
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
                                <Col span={24}><span className="text-sm">Time: {item.inspection_time}</span></Col>
                              </Row>
                              <Row className="mb-2">
                                <Col span={24}><span className="text-sm">Status: {item.inspection_status}</span></Col>
                              </Row>
                              <Row className="mb-2">
                                <Col span={12}><span className="text-sm">Inspector: {item.inspection_name}</span></Col>
                                <Col span={12}><span className="text-sm">phone: {item.inspection_phone}</span></Col>
                              </Row>
                              <Row className="mb-2">
                                <Col span={24}><span className="text-sm">Email: {item.inspection_email}</span></Col>
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
                                  Details
                                </Button>

                                <Button
                                  className="bg-green-100 text-green-500 border-green-100 mr-3"
                                  size="small"
                                  icon={<DownloadOutlined />}
                                  onClick={() => saveInspectionFile(item.inspection_id)}
                                >
                                  Download
                                </Button>

                                <Button
                                  color="danger"
                                  size="small"
                                  variant="filled"
                                  icon={<DeleteOutlined />}
                                  onClick={() => onDeleteInspection(item.inspection_id)}
                                >
                                  Delete
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
                    <Empty description="Please Create the Inspection Record">
                      {/* <Button type="primary" onClick={createInspectionModalHandler}>Create Now</Button> */}
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
                  Inspection Time
                </label>
                <Input value={inspectionDataForm.inspection_time} readOnly />
              </Col>
              <Col span={8}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="Inspector"
                >
                  Inspector
                </label>
                <Input value={inspectionDataForm.inspection_name} readOnly />
              </Col>
              <Col span={8}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="InspectionStatus"
                >
                  Inspection Status
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
                  Phone
                </label>
                <Input value={inspectionDataForm.inspection_phone} readOnly />
              </Col>

              <Col span={12}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="email"
                >
                  Email
                </label>
                <Input value={inspectionDataForm.inspection_email} readOnly />
              </Col>
            </Row>
          </Space>
          {
            Number(inspectionDataForm.inspection_number) === 0 ? (
              <Card className="mt-6">
                <Result
                  status={'success'}
                  title="All the device is ok"
                  subTitle="No abnormalities were found during this inspection."
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
                        <span className="mr-3">Problematic Equipment</span>
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
          title="Create Inspection"
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
                  Inspection Time
                </label>
                <Input value={inspectionDataForm.inspection_time} readOnly />
              </Col>
              <Col span={8}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="Inspector"
                >
                  <span className="mr-1 text-red-600 font-thin">*</span>
                  Inspector
                </label>
                <Input value={inspectionDataForm.inspection_name} readOnly />
              </Col>
              <Col span={8}>
                <label
                  className='mb-1 flex items-center font-semibold'
                  htmlFor="Email"
                >
                  <span className="mr-1 text-red-600 font-thin">*</span>
                  Email
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
                  Have you discovered any problems?
                </label>
                <Select
                  options={inspectionDataStatus}
                  style={{ width: '100%' }}
                  value={inspectionDataForm.inspection_status}
                  placeholder="Please select"
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
                  Problem Number
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
                  Phone
                </label>
                <Input
                  placeholder="Phone Number"
                  value={inspectionDataForm.inspection_phone}
                  onChange={(e) => setInspectionDataForm({
                    ...inspectionDataForm,
                    inspection_phone: e.target.value
                  })}
                />
              </Col>
            </Row>

            {inspectionDataForm.inspection_status === 'All the device is ok' && (
              <Card className="mt-6">
                <Result
                  status={'success'}
                  title="All the device is ok"
                  subTitle="No abnormalities were found during this inspection."
                />
              </Card>
            )}

            {inspectionDataForm.inspection_status === 'Discovered problem' && (
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
                      placeholder="Select Device"
                      onChange={selectInspectionDeviceName}
                      allowClear
                    />

                  </Col>
                  <Col span={18}>
                    <Input.TextArea
                      autoSize
                      placeholder="Please provide a brief description of the issue"
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
          title="Tips"
          open={isModalDelete}
          onCancel={() => setIsModalDelete(false)}
          onOk={confirmDeleteAssetsData}
        >
          <p className="text-sm text-black">Are you sure you want to delete this data?</p>
        </Modal>
      </div>
    </>
  )
}

export default Inspection