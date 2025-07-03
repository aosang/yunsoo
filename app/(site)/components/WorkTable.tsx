'use client'
import { Button, Table, Tag, Skeleton } from "antd"
import type { TableColumnsType} from 'antd'
import { tableItems } from "@/utils/dbType"

interface workTableProps {
  workInfo: tableItems[]
  onChangeSelectData: (data:tableItems[]) => void
  onGetEditData: (data:tableItems, typeNum: number) => void
}

const WorkTable: React.FC<workTableProps> = ({ workInfo, onChangeSelectData, onGetEditData }) => {
  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: tableItems[]) => {
      onChangeSelectData(selectedRows)
    }
  }

  const onRowData = {
    onClick: (record: tableItems) => {
      onGetEditData(record, 1)
    }
  }

  const colums: TableColumnsType<tableItems> = [{
    title: '设备名称',
    dataIndex: 'created_product',
    key: 'created_product'
  }, {
    title: '类型',
    dataIndex: 'created_type',
    key: 'created_type',
  }, {
    title: '品牌',
    dataIndex: 'created_brand',
    key: 'created_brand',
  }, {
    title: '创建人',
    dataIndex: 'created_name',
    key: 'created_name'
  }, {
    title: '更新时间',
    dataIndex: 'created_update',
    key: 'created_update',
  }, {
    title: '问题描述',
    dataIndex: 'created_text',
    key: 'created_text',
    ellipsis: true
  }, {
    title: '状态',
    dataIndex: 'created_status',
    key: 'created_status',
    render: (text: string) => {
      return (
        <>
          {text === '已解决' && <Tag color="green">已解决</Tag>}
          {text === '处理中' && <Tag color="red">处理中</Tag>}
          {text === '待处理' && <Tag color="orange">待处理</Tag>}
        </>
      )
    }
  }, {
    title: '其它',
    render: (record: tableItems) => {
      return (
        <>
          <div>
            <Button 
              className="mr-2 text-xs" 
              size="small" 
              type="primary"
              onClick={() => onRowData.onClick(record)}
            >
              详情/编辑
            </Button>
          </div>   
        </>
      )
    }
  }]

  return (
    <>
      <div className="mt-5">
        <Table
          className='[&_.ant-table-thead>tr>th]:!bg-[#f0f5ff]'
          rowSelection={{...rowSelection}}
          columns={colums} 
          dataSource={workInfo}
          bordered
          size="small"
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
    </>
  )
}
 
export default WorkTable