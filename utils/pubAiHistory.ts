import { supabase } from '@/utils/clients'

export const getAiHistoryWord = async () => {
  const {data, error} = await supabase.from('ai_history')
  .select('*')
}

export const insertAiHistoryWord = async (text_name: string) => {
  const {data, error} = await supabase.from('ai_history')
  .insert({
    text_name
  })
  
  if(error) throw error
  return data
}