import { supabase } from "./clients"
import useMessage from "@/utils/message"
import { productItem } from '@/utils/dbType'

export const getItAssetsTabbleData = async (id?: string) => {
  try {
    if(id) {
      const [ deviceData ] = await Promise.all([
        supabase.from("it_assets_cn")
        .select('*')
        .eq('id', id)
        .order('product_time', { ascending: false }),
      ])

      if(deviceData.error) throw deviceData.error
      return deviceData.data

    }else {
      const { data, error } = await supabase
      .from("it_assets_cn")
      .select('*')
      .order('product_time', { ascending: false })
  
      return data
    }
  }
  catch (error) {
    throw error
  }
}

export const getCodeAssetsData = async (query?: string) => {
  const { data, error } = await supabase
  .from('loanout_table_cn')
  .select('*')
  .eq('loanout_id', query)

  try {
    if (data) return data || []
    useMessage(2, error?.message, 'error')
  }
  catch (error) {
    throw error
  }
}

// get IT assets status
export const getItAssetsStatusData = async () => {
  const { data, error } = await supabase.from('it_status_cn').select('*')
  try {
    if (data) return data || []
    useMessage(2, error?.message, 'error')
  }
  catch (error) {
    throw error
  }
}

// insert it assets
export const insertItAssets = async ({
  product_name,
  product_type,
  product_time,
  product_update,
  product_brand,
  product_number,
  product_price,
  product_remark,
  value
}) => {
  // console.log(product_time, product_update)
  const { data, error } = await supabase.from('it_assets_cn')
  .insert({
    product_name,
    product_type,
    product_time,
    product_update,
    product_brand,
    product_number,
    product_price,
    product_remark,
    value
  })
  .select('*')

  try {
    if (data) {
      useMessage(2, '创建成功!', 'success')
      return data
    }
    useMessage(2, error!.message, 'error')
  } catch (error) {
    throw error
  }
}

// delete
export const deleteItAssets = async (id: string[]) => {
  const { error } = await supabase
    .from('it_assets_cn')
    .delete()
    .in('id', id)
  try {
    if (error) return useMessage(2, error.message, 'error')
    useMessage(2, '删除成功!', 'success')
  } catch (error) {
    throw error
  }
}

export const searchItAssetsData = async (
  type?: string | null,  startTime?: string | null, endTime?: string | null
) => {
  if (type && !startTime) {
    const { data, error } = await supabase.
      from('it_assets_cn')
      .select('*')
      .eq('product_type', type)

    try {
      if (data) return data
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }
  } else if (!type && startTime) {
    const { data, error } = await supabase
      .from('it_assets_cn')
      .select('*')
      .gte('product_time', startTime)
      .lte('product_time', endTime)

    try {
      if (data) return data
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }

  } else if (type && startTime) {
    const { data, error } = await supabase
     .from('it_assets_cn')
     .select('*')
     .eq('product_type', type)
     .gte('product_time', startTime)
     .lte('product_time', endTime)

     try {
      if (data) return data
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }

  } else {
    const { data, error } = await supabase.
      from('it_assets_cn')
      .select('*')

    try {
      if (data) return data
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }
  }
}

// update
export const editItAssetsData = async (assetsId: string, assetsOrderForm: productItem) => {
  const { error } = await supabase
  .from('it_assets_cn')
  .update(assetsOrderForm)
  .eq('id', assetsId)

  try {
    if(error) return useMessage(2, error!.message, 'error')
    useMessage(2, '更新成功!','success')
  } catch (error) {
    throw error
  }
}

export const uploadExcelItAssetsData = async (jsonData: productItem[]) => {
  const {data: insertedData, error} = await supabase
  .from('it_assets_cn')
  .upsert(jsonData)

  if(error) return useMessage(2, error.message, 'error')
  return insertedData
}