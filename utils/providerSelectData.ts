import { supabase } from "./clients"
import useMessage from "./message"
import { getTimeNumber } from "./pubFunProvider"
import { updateProfilesItem } from '@/utils/dbType'

// get session
export const getSession = async () => {
  const {data: session, error} = await supabase.auth.getSession()
  try {
    if (session) return session
    useMessage(2, error!.message, 'error')
  } catch (error) {
    throw error
  }
}

// get user
export const getUser = async () => {
  const {data: user, error} = await supabase.auth.getUser()
  try {
    if (user) return user
    useMessage(2, error!.message, 'error')
  } catch (error) {
    throw error
  }
}

// get profiles
export const getProfiles = async (id?: string | null) => {
  if(!id) {
    const {data, error} = await supabase.from('profiles').select('*')
    try {
      if (data) return data
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }
  }else {
    const {data, error} = await supabase.from('profiles').select('*').eq('id', id)
    try {
      if (data) return data
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }
  }
}

// update profiles
export const updateProfiles = async (userId: string, updateForm: updateProfilesItem) => {
  
  const {data, error} = await supabase
    .from('profiles')
    .update({
      username: updateForm.username,
      company: updateForm.company,
      avatar_url: updateForm.avatar_url,
      email: updateForm.email,
      created_at: updateForm.created_at
    })
    .eq('id', userId)
  try{
    // if(!error) return useMessage(2, '更新成功!', 'success')
    if(error) return useMessage(2, '更新失败!', 'error')
  }catch (error) {
    throw error
  }
}

// get workOrder type
export const getWorkOrderType = async () => {
  const {data, error} = await supabase.from('product_type_cn').select('*')
  try {
    if (data) return data.sort((a, b) => a.product_id.localeCompare(b.product_id))
    useMessage(2, error!.message, 'error')
  } catch (error) {
    throw error
  }
}

// get workOrder brand
export const getWorkBrand = async (keys: string) => {
  let key = keys
  const {data, error} = await supabase
  .from('product_type_cn')
  .select(`key, product_brand_cn(value, brand_id, logo_url)`)
  .eq('key', key)

  try {
    if(data) return data
    useMessage(2, error!.message, 'error')
  } catch (error) {
    throw error
  }
}

// get workOrder status
export const getWorkOrderStatus = async () => {
  const {data, error} = await supabase.from('product_status_cn').select('*')
  try {
    if(data) return data
    useMessage(2, error!.message, 'error')
  }catch (error) {
    throw error
  }
}

// get workOrder
export const getWorkOrder = async (id?: string) => {
  const {data, error} = await supabase.
    from('work_order_cn')
    .select('*')
    .match({id: id})
  try {
    if(data) { 
      data.sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime())
      return data
    }else {
      useMessage(2, error!.message, 'error')
    }
  }catch (error) {
    throw error
  }
}

// get workOrder count
export const getWorkOrderCount = async () => {
  try {
    const [finishedData, processingData, pendingData] = await Promise.all([
      supabase.from('work_order_cn').select('*').eq('created_status', '已完成'),
      supabase.from('work_order_cn').select('*').eq('created_status', '处理中'),
      supabase.from('work_order_cn').select('*').eq('created_status', '待处理'),
    ])

    if (finishedData.error) throw finishedData.error
    if (processingData.error) throw processingData.error
    if (pendingData.error) throw pendingData.error

    return {
      finished: finishedData.data?.length || 0,
      processing: processingData.data?.length || 0,
      pending: pendingData.data?.length || 0,
      total: (finishedData.data?.length || 0) + (processingData.data?.length || 0) + (pendingData.data?.length || 0)
    }
  } catch (error) {
    throw error
  }
}

// get assets count
export const getAllAssetsCount = async () => {
  try {
    const [
      computerNum, 
      laptopNum, 
      serverNum, 
      switchNum, 
      printerNum, 
      routerNum, 
      mobileNum, 
      monitorNum, 
      keyboardMouseNum, 
      othersNum
    ] = await Promise.all([
      supabase.from('it_assets_cn').select('product_number').eq('product_type', '电脑'),
      supabase.from('it_assets_cn').select('product_number').eq('product_type', '笔记本'),
      supabase.from('it_assets_cn').select('product_number').eq('product_type', '服务器'),
      supabase.from('it_assets_cn').select('product_number').eq('product_type', '交换机'),
      supabase.from('it_assets_cn').select('product_number').eq('product_type', '打印机'),
      supabase.from('it_assets_cn').select('product_number').eq('product_type', '路由器'),
      supabase.from('it_assets_cn').select('product_number').eq('product_type', '手机'),
      supabase.from('it_assets_cn').select('product_number').eq('product_type', '显示器'),
      supabase.from('it_assets_cn').select('product_number').eq('product_type', '键盘/鼠标'),
      supabase.from('it_assets_cn').select('product_number').eq('product_type', '其它')
    ])
    
    if (computerNum.error) throw computerNum.error
    if (laptopNum.error) throw laptopNum.error
    if (serverNum.error) throw serverNum.error
    if (switchNum.error) throw switchNum.error
    if (printerNum.error) throw printerNum.error
    if (routerNum.error) throw routerNum.error
    if (mobileNum.error) throw mobileNum.error
    if (monitorNum.error) throw monitorNum.error
    if (keyboardMouseNum.error) throw keyboardMouseNum.error
    if (othersNum.error) throw othersNum.error

    return {
      computerNum: computerNum.data[0]?.product_number || 0,
      laptopNum: laptopNum.data[0]?.product_number || 0,
      serverNum: serverNum.data[0]?.product_number || 0,
      switchNum: switchNum.data[0]?.product_number || 0,
      printerNum: printerNum.data[0]?.product_number || 0,
      routerNum: routerNum.data[0]?.product_number || 0,
      mobileNum: mobileNum.data[0]?.product_number || 0,
      monitorNum: monitorNum.data[0]?.product_number || 0,
      keyboardMouseNum: keyboardMouseNum.data[0]?.product_number || 0,
      othersNum: othersNum.data[0]?.product_number || 0,
      total: (computerNum.data[0]?.product_number || 0) + (laptopNum.data[0]?.product_number || 0) + (serverNum.data[0]?.product_number || 0) + (switchNum.data[0]?.product_number || 0) + (printerNum.data[0]?.product_number || 0) + (routerNum.data[0]?.product_number || 0) + (mobileNum.data[0]?.product_number || 0) + (monitorNum.data[0]?.product_number || 0) + (keyboardMouseNum.data[0]?.product_number || 0) + (othersNum.data[0]?.product_number || 0)
    }
  }catch (error) {
    throw error
  }
}

// get total assets price
export const getTotalAssetsPrice = async () => {
  try {
    const {data, error} = await supabase
    .from('it_assets_cn')
    .select('product_price')
    
    if(data) return data.reduce((total, item) => total + (item.product_price || 0), 0)
    if(error) throw error
    return 0
  } catch (error) {
    useMessage(2, '获取价格失败!' , 'error')
    throw error
  }
}

// insert workOrder
export const insertUpdateWorkOrder = async ({
    created_product, 
    created_name,
    created_time,
    created_update,
    created_text, 
    created_solved, 
    created_type,
    created_brand,
    created_status,
    created_remark
  }) => {
  const {data, error} = await supabase
  .from('work_order_cn')
  .insert({
    created_id: getTimeNumber()[1],
    created_product,
    created_time,
    created_update,
    created_name: created_name,
    created_text: created_text,
    created_solved,
    created_type,
    created_brand,
    created_status,
    created_remark,
  })
  .select()

  try {
    if(data) {
      useMessage(2, '创建成功!','success')
      return data
    }
    useMessage(2, error!.message, 'error')
  }catch (error) {
    throw error
  }
}

// Delete workOrder
export const deleteWorkOrder = async (deleteId: string[]) => {
  const { error } = await supabase
    .from('work_order_cn')
    .delete()
    .in('created_id', deleteId)

  try {
    if(error) return useMessage(2, error.message, 'error')
    useMessage(2, '删除成功!','success')
  }catch (error) {
    throw error
  }
}
