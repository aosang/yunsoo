import { supabase } from "./clients"
import { knowledgeTypeItem } from "@/utils/dbType"
import useMessage from "@/utils/message"

export const getLibraryTableData = async (type?: string) => {
  const query = supabase.from('library_table_cn')
  const {data, error} = await(type ? query.select('*').eq('type', type) : query.select('*'))
  try {
    if(data) return data
    useMessage(2, error!.message, 'error')
  } catch (error) {
    throw error
  }
}

export const insertLibraryData = async ({title, author, type, created_time, content, description }: knowledgeTypeItem) => {
  const {data, error} = await supabase.from('library_table_cn')
  .insert({
    title,
    author,
    type,
    created_time,
    content,
    description
  })
  .select('*')
  try {
    if(data) return data
    useMessage(2, error!.message, 'error')
  } catch (error) {
    throw error
  }
}

export const updateLibraryTableData = async (id: string, form: knowledgeTypeItem) => {
  const {data, error} = await supabase.from('library_table_cn')
  .update(form)
  .eq('id', id)
  .select('*')
  try {
    if(error) return useMessage(2, error!.message, 'error')
  } catch (error) {
    throw error
  }
}

export const deleteLibraryTableData = async (id: string) => {
  const { error} = await supabase
  .from('library_table_cn')
  .delete()
  .eq('id', id)

  try {
    if(error) return useMessage(2, error!.message, 'error')
  } catch (error) {
    throw error
  }
}

export const getLibrarysDataList = async (id?: string) => {
  const {data, error} = await supabase
  .from('library_table_cn')
  .select('*')
  .eq('id', id)
  return data
}