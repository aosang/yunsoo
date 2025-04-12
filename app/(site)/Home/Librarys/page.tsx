"use client"
import { useState, useEffect } from "react"
import { Card, Button, Select, List, Divider, Tag, Modal, Skeleton } from "antd"
import { getWorkOrderType } from "@/utils/providerSelectData"
import { typeDataName, knowledgeTypeItem } from "@/utils/dbType"
import dynamic from "next/dynamic"
import useMessage  from "@/utils/message"
import { ImBooks } from "react-icons/im"
import { RiComputerFill, RiServerFill, RiSwitchFill, RiRouterFill, RiPrinterFill } from "react-icons/ri"
import { PiLaptopFill, PiMonitorPlayFill } from "react-icons/pi"
import { MdOtherHouses, MdKeyboard } from "react-icons/md"
import { BiSolidMobile } from "react-icons/bi"
import { getLibraryTableData, deleteLibraryTableData, getLibrarysDataList } from "@/utils/provideLibraryData"
import { useRouter } from "next/navigation"
const ReactWEditor = dynamic(() => import('../../components/Editor'), {
  ssr: false,
  loading: () => <p className="text-base text-blue-950">Loading...</p>
})

const UpdateEditor = dynamic(() => import('../../components/EditorUpdate'), {
  ssr: false,
  loading: () => <p className="text-base text-blue-950">Loading...</p>
})

const Librarys = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [libraryList, setLibraryList] = useState<knowledgeTypeItem[]>([])
  const [LibrarysType, setLibrarysType] = useState<typeDataName[]>([])
  const [editorModal, setEditorModal] = useState<boolean>(false)
  const [updateEditorModal, setUpdateEditorModal] = useState<boolean>(false)
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false)
  const [deleteId, setDeleteId] = useState<string>('')
  const [editInfo, setEditInfo] = useState<any>('')

  const getLibrarysType = () => {
    getWorkOrderType().then(res => {
      setLibrarysType(res as typeDataName[])
    })
  }

  const getLibraryListData = (type?: string) => {
    getLibraryTableData(type).then(res => {
      setLibraryList(res as [])
      setIsLoading(false)
    })
  }

  const goToLibrarysDetails = (id: string) => {
    // router.push(`/KnowledgeTemplate?KnowledgeId=${id}`)
    window.open(`/KnowledgeTemplate?KnowledgeId=${id}`, '_blank')
  }

  const delteLibrarModal = (id: string) => {
    setIsDeleteModal(true)
    setDeleteId(id)
  }
  
  const delteLibrarysList = () => {
    deleteLibraryTableData(deleteId).then(res => {
      getLibraryListData()
      setIsDeleteModal(false)
      useMessage(2, 'Delete Success!', 'success')
    })
  }

  const editLibraryModal = (id: string) => {
    getLibrarysDataList(id).then(res => {
      setEditInfo(res)
      setUpdateEditorModal(true)
    })
  }

  useEffect(() => {
    getLibrarysType()
    getLibraryListData()
    
    document.title = 'Librarys'
  }, [])

  return (
    <>
      {/* delete modal */}
      <Modal
        title="Delete the library"
        open={isDeleteModal}
        onCancel={() => setIsDeleteModal(false)}
        onOk={delteLibrarysList}
      >
        <p>Are you sure you want to delete this Librarys?</p>
      </Modal>
    
      <div style={{ width: '100%', padding: '12px', boxSizing: 'border-box', overflowY: 'visible' }}>
        <Card>
          <div
            className="
            w-full 
            h-11
            rounded-md 
            flex 
            justify-center 
            items-center
            bg-blue-50"
          >
            <ImBooks style={{ color: '#4483f5', opacity: 0.65 }} className="text-4xl" />
            <span className="text-base ml-6" style={{ color: '#00091a' }}>IT Equipment Knowledge Base</span>
          </div>
          <Skeleton active loading={isLoading} paragraph={{rows: 10}}>
          {(!editorModal && !updateEditorModal) &&
            <>
              <div className="flex mt-4 items-center">
                <Button type="primary" onClick={() => { setEditorModal(true) }}>Create</Button>
                <div className="mt-0 mb-0 mr-0 ml-auto">
                  <Select
                    className="w-40"
                    placeholder="Select Type"
                    allowClear
                    options={LibrarysType}
                    onChange={(value) => {getLibraryListData(value)}}
                  >
                  </Select>
                </div>
              </div>
              <Divider />
              <div style={{
                maxHeight: '600px', 
                overflowY: 'auto', 
                scrollbarWidth: 'thin', 
                scrollbarColor: '#80abf8 transparent'}}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={libraryList}
                  renderItem={item => (
                    <List.Item actions={[
                      <a className="text-blue-500" onClick={() => editLibraryModal(item.id)}>edit</a>,
                      <a className="text-red-500" onClick={() => delteLibrarModal(item.id)}>delete</a>,
                    ]}>
                      <List.Item.Meta
                        avatar={
                          <div className="w-9 h-9 bg-blue-600 rounded-full flex justify-center items-center text-base">
                            {item.type == 'Computer' && <RiComputerFill className="text-white opacity-65" />}
                            {item.type == 'Server' && <RiServerFill className="text-white opacity-65" />}
                            {item.type == 'Switch' && <RiSwitchFill className="text-white opacity-65" />}
                            {item.type == 'Router' && <RiRouterFill className="text-white opacity-65" />}
                            {item.type == 'Printer' && <RiPrinterFill className="text-white opacity-65" />}
                            {item.type == 'Laptop' && <PiLaptopFill className="text-white opacity-65" />}
                            {item.type == 'Mobile' && <BiSolidMobile className="text-white opacity-65" />}
                            {item.type == 'Monitor' && <PiMonitorPlayFill className="text-white opacity-65" />}
                            {item.type == 'Keyboard/Mouse' && <MdKeyboard className="text-white opacity-65" />}
                            {item.type == 'Other' && <MdOtherHouses className="text-white opacity-65" />}
                          </div>
                        }
                        title={
                          <div className="flex items-center">
                            <span className="
                            block
                            text-gray-600 
                            hover:text-blue-500 cursor-pointer hover:underline"
                            onClick={() => goToLibrarysDetails(item.id)}
                            >
                              {item.title}
                            </span>
                          </div>
                        }
                        description={item.description}
                      />
                      <div className="flex text-gray-400 text-sm ">
                        <p className="mb-0">{item.created_time}</p>
                        {item.type == 'Computer' && <Tag color="magenta" className="ml-4">Computer</Tag>}
                        {item.type == 'Server' && <Tag color="red" className="ml-3">Server</Tag>}
                        {item.type == 'Switch' && <Tag color="volcano" className="ml-3">Switch</Tag>}
                        {item.type == 'Router' && <Tag color="purple" className="ml-3">Router</Tag>}
                        {item.type == 'Printer' && <Tag color="gold" className="ml-3">Printer</Tag>}
                        {item.type == 'Laptop' && <Tag color="blue" className="ml-3">Laptop</Tag>}
                        {item.type == 'Mobile' && <Tag color="green" className="ml-3">Mobile</Tag>}
                        {item.type == 'Monitor' && <Tag color="geekblue" className="ml-3">Monitor</Tag>}
                        {item.type == 'Keyboard/Mouse' && <Tag color="geekblue" className="ml-3">Keyboard/Mouse</Tag>}
                        {item.type == 'Other' && <Tag color="cyan" className="ml-3">Other</Tag>}
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </>
          }
          </Skeleton>
          {editorModal && 
            <div className="mt-4">
              <ReactWEditor 
                isEdit={editorModal} 
                setIsEdit={setEditorModal} 
                onSubmit={getLibraryListData}
              />
            </div>
          }

          {updateEditorModal &&
            <div className="mt-4">
              <UpdateEditor 
                isEdit={updateEditorModal} 
                setIsEdit={setUpdateEditorModal} 
                onSubmit={getLibraryListData}
                editInfo={editInfo}
              />
            </div>
          }
        </Card>
      </div>
    </>
  )
}

export default Librarys