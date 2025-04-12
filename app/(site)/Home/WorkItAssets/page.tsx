'use client'
import { useEffect } from "react"
import { Card } from "antd"
import WorkItAssetsTable from "../../components/WorkItAssetsTable"
const WorkItAssets = () => {
  useEffect(() => {
    document.title = 'IT Assets'
  }, [])
  return (
    <div className="p-3">
      <Card title="IT Assets">
        <WorkItAssetsTable />
      </Card>
    </div>
  )
}

export default WorkItAssets