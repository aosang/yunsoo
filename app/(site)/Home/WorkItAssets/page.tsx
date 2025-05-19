'use client'
import { useEffect } from "react"
import { Card } from "antd"
import WorkItAssetsTable from "@components/WorkItAssetsTable"
const WorkItAssets = () => {
  useEffect(() => {
    document.title = 'IT设备'
  }, [])
  return (
    <div className="p-3">
      <Card title="IT设备">
        <WorkItAssetsTable />
      </Card>
    </div>
  )
}

export default WorkItAssets