import { supabase } from "./clients"
import { workOrderFormProps } from '@/utils/dbType'
import useMessage from "@/utils/message"



export const editWorkOrderData = async (orderId: string, workOrderForm: workOrderFormProps) => {
  const { error } = await supabase
  .from('work_order_cn')
  .update(workOrderForm)
  .eq('created_id', orderId)

  try {
    if(error) return useMessage(2, error!.message, 'error')
    
  } catch (error) {
    throw error
  }
}