import { supabase } from "./clients"
import useMessage from "@/utils/message"
import { getTimeNumber } from "./pubFunProvider"
import { inspectionForms } from '@/utils/dbType'

export const getInspectionStatusData = async () => {
  const { data, error } = await supabase.from('inspection_status_cn').select('*')
  try {
    if (data) return data || []
    useMessage(2, error?.message, 'error')
  }
  catch (error) {
    throw error
  }
}

export const getInspectionDeviceData = async (id?: string) => {
  const {data, error} = await supabase
  .from('inspection_table_cn')
  .select('*')
  .match({id: id})
  .order('inspection_time', {ascending: false})
  try {
    if (data) return data || []
    useMessage(2, error?.message, 'error')
  }catch(error) {
    throw error
  }
}

export const getInspectionDetailsDeviceData = async (inspectionId?: string) => {
  const {data, error} = await supabase
  .from('inspection_table_cn')
  .select('*')
  .match({inspection_id: inspectionId})
  try {
    if (data) return data || []
    useMessage(2, error?.message, 'error')
  }catch(error) {
    throw error
  }
}

export const insertInspectionDeviceData = async ({
    inspection_id,
    inspection_time,
    inspection_number,
    inspection_phone,
    inspection_name,
    inspection_email,
    inspection_status,
    inspection_deviceData
}: inspectionForms) => {
  const {data, error} = await supabase.from('inspection_table_cn').insert({
    inspection_id: getTimeNumber()[1],
    inspection_time,
    inspection_number,
    inspection_phone,
    inspection_name,
    inspection_email,
    inspection_status,
    inspection_deviceData
  })
  .select('*')
  try {
    if (data) {
      useMessage(2, 'Inspection record create sucessful!','success')
      return data
    }
    useMessage(2, error?.message, 'error')
  }catch(error) {
    throw error
  }
}

// delete
export const deleteInspectionDevice = async (id: any) => {
  const { error } = await supabase
  .from('inspection_table_cn')
  .delete()
  .eq('inspection_id', id)

  try {
    if (error) return useMessage(2, error?.message, 'error')
    useMessage(2, '巡检记录删除成功!','success')
  }catch(error) {
    throw error
  }
}

// search
export const searchFilterInspectionData = async (
  id: string | null, filterType?: string | null, filterStartTime?: string | null, filterEndTime?: string | null
) => {
  if(filterType && !filterStartTime) {
    const { data, error } = await supabase
     .from('inspection_table_cn')
     .select('*')
     .match({id: id})
     .eq('inspection_status', filterType)
    try {
      if (data) return data || []
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }
  } else if (!filterType && filterStartTime) {
    const { data, error } = await supabase
    .from('inspection_table_cn')
    .select('*')
    .match({id: id})
    .gte('inspection_time', filterStartTime)
    .lte('inspection_time', filterEndTime)
    try {
      if (data) return data || []
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }
  }else if (filterType && filterStartTime) {
    const { data, error } = await supabase
    .from('inspection_table_cn')
    .select('*')
    .match({id: id})
    .eq('inspection_status', filterType)
    .gte('inspection_time', filterStartTime)
    .lte('inspection_time', filterEndTime)
    try {
      if (data) return data || []
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }
  } else {
    const { data, error } = await supabase
    .from('inspection_table_cn')
    .select('*')

    try {
      if (data) return data || []
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }
  }

}
