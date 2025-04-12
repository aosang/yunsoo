import { supabase } from "./clients"
import useMessage from './message'

export const getFilterWorkType = async () => {
  const {data, error} = await supabase.from('product_type').select('*').order('product_id')
  try {
    if (data) return data
    useMessage(2, error!.message, 'error')
  } catch (error) {
    throw error
  }
}

export const getFilterWorkStatus = async () => {
  const {data, error} = await supabase.from('product_status').select('*')
  try {
    if (data) return data
    useMessage(2, error!.message, 'error')
  } catch (error) {
    throw error
  }
}

export const searchTypeData = async (
  type?: string | null, status?: string | null, startTime?: string | null, endTime?: string | null
) => {
  if(type && !status && !startTime) {
    const {data, error} = await supabase.
    from('work_order')
    .select('*')
    .eq('created_type', type)

    try {
      if (data) return data
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }
  }else if(status && !type && !startTime) {
    const {data, error} = await supabase.
    from('work_order')
    .select('*')
    .eq('created_status', status)

    try {
      if (data) return data
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }  
  }else if(status && type && !startTime) {
    const {data, error} = await supabase.
    from('work_order')
    .select('*')
    .eq('created_type', type)
    .eq('created_status', status)

    try {
      if (data) return data
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }
  }else if(!type && !status && startTime) {
    const {data, error} = await supabase
    .from('work_order')
    .select('*')
    .gte('created_time', startTime)
    .lte('created_time', endTime)

    try {
      if (data) return data
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }

  }else if(type && !status && startTime) {
    const {data, error} = await supabase
    .from('work_order')
    .select('*')
    .eq('created_type', type)
    .gte('created_time', startTime)
    .lte('created_time', endTime)

    try {
      if (data) return data
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }

  }else if(!type && status && startTime) {
    const {data, error} = await supabase
    .from('work_order')
    .select('*')
    .eq('created_status', status)
    .gte('created_time', startTime)
    .lte('created_time', endTime)

    try {
      if (data) return data
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }
  }else if(type && status && startTime) {
    const {data, error} = await supabase
    .from('work_order')
    .select('*')
    .eq('created_type', type)
    .eq('created_status', status)
    .gte('created_time', startTime)
    .lte('created_time', endTime)

    try {
      if (data) return data
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }
  }else {
    const {data, error} = await supabase
    .from('work_order')
    .select('*')
    try {
      if (data) return data
      useMessage(2, error!.message, 'error')
    } catch (error) {
      throw error
    }
  }
}