import { supabase } from './clients'
import { userManageItem } from './dbType'
import message from './message'
import { getTimeNumber } from './pubFunProvider'

export const getUserManageData = async () => {
  const { data, error } = await supabase.from('user_manage').select('*').order('created_at', { ascending: false })
  if (error) {
    message(2, '获取失败', 'error')
  }
  return data
}

export const insertUserData = async ({ manage_name, manage_phone, manage_email, manage_role, manage_remark }: userManageItem) => {
  const { data, error } = await supabase.from('user_manage').insert({
    manage_num: getTimeNumber()[1],
    manage_name,
    manage_phone,
    manage_email,
    manage_role,
    manage_remark,
    value: manage_name
  })
  if (error) {
    message(2, '新增失败', 'error')
  }
  return message(2, '新增成功', 'success')
}

export const updateUserData = async (manage_num: string, { manage_name, manage_phone, manage_email, manage_role, manage_remark }: userManageItem) => {
  const { data, error } = await supabase.from('user_manage').update({
    manage_name,
    manage_phone,
    manage_email,
    manage_role,
    manage_remark,
  }).eq('manage_num', manage_num)
  if (error) {
    message(2, '编辑失败', 'error')
  }
  return message(2, '编辑成功', 'success')
}

export const deleteUserData = async (manage_num: string) => {
  const { data, error } = await supabase.from('user_manage')
  .delete()
  .in('manage_num', manage_num.split(','))
  if (error) {
    message(2, '删除失败', 'error')
  }
  return message(2, '删除成功', 'success')
}
