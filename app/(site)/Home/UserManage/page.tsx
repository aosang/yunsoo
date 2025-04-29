'use client'
import { useEffect, useState } from 'react'
import { Card, Table, Button, Row, Col, Modal, Input, Divider } from 'antd'
import { userManageItem } from '@/utils/dbType'
import message from '@/utils/message'
import { getUserManageData, insertUserData, updateUserData, deleteUserData } from '@/utils/providerUserData'

const UserManage = () => {
  const [editId, setEditId] = useState('')
  const [isAddModal, setIsAddModal] = useState(false)
  const [deleteIds, setDeleteIds] = useState<string>('')
  const [isEditModal, setIsEditModal] = useState(false)
  const [userManageData, setUserManageData] = useState<userManageItem[]>([])
  const [userManageForm, setUserManageForm] = useState<userManageItem>({
    manage_num: '',
    manage_name: '',
    manage_phone: '',
    manage_email: '',
    manage_role: '',
    manage_remark: '',
  })

  const columns = [{
    title: '编号',
    key: 'manage_num',
    dataIndex: 'manage_num',
  }, {
    title: '姓名',
    key: 'manage_name',
    dataIndex: 'manage_name',
  }, {
    title: '手机号',
    key: 'manage_phone',
    dataIndex: 'manage_phone',
  }, {
    title: '邮箱',
    key: 'manage_email',
    dataIndex: 'manage_email',
  }, {
    title: '职位',
    key: 'manage_role',
    dataIndex: 'manage_role',
  }, {
    title: '备注',
    key: 'manage_remark',
    dataIndex: 'manage_remark',
  }, {
    title: '操作',
    key: 'action',
    dataIndex: 'action',
    render: (record) => {
      return <Button 
      type='primary' 
      size='small' 
      className='text-[12px]'
      onClick={()=> {
        setIsEditModal(true)
      }}
    >
      编辑/详情
    </Button>
    }
  }]

  const closeIsAddModal = () => {
    setIsAddModal(false)
  }

  const closeIsEditModal = () => {
    setIsEditModal(false)
  }

  const clearUserManageForm = () => {
    setUserManageForm({
      manage_num: '',
      manage_name: '',
      manage_phone: '',
      manage_email: '',
      manage_role: '',
      manage_remark: '',
    })
  }

  const getMyUserManageData = () => {
    getUserManageData().then((res) => {
      if (res) {
        setUserManageData(res)
      }
    })
  }

  const addUserManageEvent = () => {
    const { manage_name, manage_phone, manage_email, manage_role } = userManageForm
    if (!manage_name || !manage_phone || !manage_email || !manage_role) {
      message(2, '请填写完整信息', 'error')
      return
    }else {
      insertUserData(userManageForm).then(() => {
        closeIsAddModal()
        getMyUserManageData()
      })
    }
  }

  const editUserManageEvent = () => {
    updateUserData(editId, userManageForm).then(() => {
      setIsEditModal(false)
      getMyUserManageData()
    })
  }

  const deleteUserManageEvent = () => {
    deleteUserData(deleteIds).then(() => {
      getMyUserManageData()
    })
  }

  useEffect(() => {
    document.title = '人员管理'
    getMyUserManageData()
  }, [])

  return (
    <>
      <Modal
        title="新增人员"
        open={isAddModal}
        onCancel={closeIsAddModal}
        width={900}
        maskClosable={false}
        onOk={addUserManageEvent}
        okText='新增'
        cancelText='取消'
        afterClose={clearUserManageForm}
      >
        <Divider />
        <Row gutter={12} className='mb-4'>
          <Col span={12}>
            <label htmlFor="manage_name" className='mb-1 flex items-center'>
              <span className='text-red-600'>*</span>姓名
            </label>
            <Input 
              placeholder='请输入姓名' 
              value={userManageForm.manage_name} 
              onChange={(e) => 
              setUserManageForm({ ...userManageForm, manage_name: e.target.value })} 
            />
          </Col>
          <Col span={12}>
            <label htmlFor="manage_phone" className='mb-1 flex items-center'>
              <span className='text-red-600'>*</span>手机号
            </label>
            <Input 
              placeholder='请输入手机号' 
              value={userManageForm.manage_phone} 
              onChange={(e) => 
              setUserManageForm({ ...userManageForm, manage_phone: e.target.value })} 
            />
          </Col>
        </Row>
        <Row gutter={12} className='mb-4'>
          <Col span={12}>
            <label htmlFor="manage_email" className='mb-1 flex items-center'>
              <span className='text-red-600'>*</span>邮箱
            </label>
            <Input 
              placeholder='请输入邮箱' 
              value={userManageForm.manage_email} 
              onChange={(e) => 
              setUserManageForm({ ...userManageForm, manage_email: e.target.value })} 
            />
          </Col>
          <Col span={12}>
            <label htmlFor="manage_role" className='mb-1 flex items-center'>
              <span className='text-red-600'>*</span>职位
            </label>
            <Input 
              placeholder='请输入职位' 
              value={userManageForm.manage_role} 
              onChange={(e) => 
              setUserManageForm({ ...userManageForm, manage_role: e.target.value })} 
            />
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={24}>
            <label htmlFor="manage_remark" className='mb-1'>备注</label>
            <Input.TextArea 
              autoSize={{ minRows: 3, maxRows: 3 }}
              placeholder='请输入备注' 
              maxLength={100}
              showCount
              value={userManageForm.manage_remark}
              onChange={(e) => 
              setUserManageForm({ ...userManageForm, manage_remark: e.target.value })} 
            />
          </Col>
        </Row>
        <Divider className='mt-10' />
      </Modal>
      <Modal
        title="编辑人员"
        open={isEditModal}
        onCancel={closeIsEditModal}
        width={900}
        maskClosable={false}
        onOk={editUserManageEvent}
        okText='编辑'
        cancelText='取消'
        afterClose={clearUserManageForm}
      >
        <Divider />
        <Row gutter={12} className='mb-4'>
          <Col span={12}>
            <label htmlFor="manage_name" className='mb-1 flex items-center'>
              <span className='text-red-600'>*</span>姓名
            </label>
            <Input 
              placeholder='请输入姓名' 
              value={userManageForm.manage_name} 
              onChange={(e) => 
              setUserManageForm({ ...userManageForm, manage_name: e.target.value })} 
            />
          </Col>
          <Col span={12}>
            <label htmlFor="manage_phone" className='mb-1 flex items-center'>
              <span className='text-red-600'>*</span>手机号码
            </label>
            <Input 
              placeholder='请输入手机号' 
              value={userManageForm.manage_phone} 
              onChange={(e) => 
              setUserManageForm({ ...userManageForm, manage_phone: e.target.value })} 
            />
          </Col>
        </Row>
        <Row gutter={12} className='mb-4'>
          <Col span={12}>
            <label htmlFor="manage_email" className='mb-1 flex items-center'>
              <span className='text-red-600'>*</span>邮箱
            </label>
            <Input 
              placeholder='请输入邮箱' 
              value={userManageForm.manage_email} 
              onChange={(e) => 
              setUserManageForm({ ...userManageForm, manage_email: e.target.value })} 
            />
          </Col>
          <Col span={12}>
            <label htmlFor="manage_role" className='mb-1 flex items-center'>
              <span className='text-red-600'>*</span>职位
            </label>
            <Input 
              placeholder='请输入职位' 
              value={userManageForm.manage_role} 
              onChange={(e) => 
              setUserManageForm({ ...userManageForm, manage_role: e.target.value })} 
            />
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={24}>
            <label htmlFor="manage_remark" className='mb-1'>备注</label>
            <Input.TextArea 
              autoSize={{ minRows: 3, maxRows: 3 }}
              placeholder='请输入备注' 
              maxLength={100}
              showCount
              value={userManageForm.manage_remark}
              onChange={(e) => 
              setUserManageForm({ ...userManageForm, manage_remark: e.target.value })} 
            />
          </Col>
        </Row>
        <Divider className='mt-10' />
      </Modal>
      <div style={{ width: '100%', padding: '12px', boxSizing: 'border-box' }}>
        <Card title="人员管理">
          <Row gutter={10}>
            <Col><Button type='primary' onClick={() => setIsAddModal(true)}>新增人员</Button></Col>
            <Col><Button type='primary' danger onClick={deleteUserManageEvent}>删除</Button></Col>
          </Row>
          <Table
            className='[&_.ant-table-thead>tr>th]:!bg-[#f0f5ff]'
            bordered size='small' 
            columns={columns}
            style={{ marginTop: '15px' }}
            rowSelection={{
              onChange: (selectedRowKeys, selectedRows) => {
                setDeleteIds(selectedRows.map((item) => item.manage_num).join(','))
              }
            }} 
            onRow={(record) => {
              return {
                onClick: () => {
                  setEditId(record.manage_num)
                  setUserManageForm(record)
                }
              }
            }}
            dataSource={userManageData}
          />
        </Card>
      </div>
    </>
  )
}

export default UserManage