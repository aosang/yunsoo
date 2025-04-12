import { supabase } from "./clients"

export const getLoanOutTableData = async (id?: string) => {
  if (id) {
    const [loanoutData] = await Promise.all([
      supabase.from('loanout_table').select('*').eq('id', id)
    ])

    if (loanoutData.error) throw loanoutData.error
    return loanoutData.data
  } else {
    const { data, error } = await supabase
      .from('loanout_table')
      .select('*')

    if (error) throw error
    return data
  }
}

export const insertLoanOutTableData = async ({
  id,
  loanout_id,
  loanout_name,
  loanout_type,
  loanout_brand,
  loanout_number,
  loanout_time,
  loanout_user,
  loanout_remark,
  value
}) => {
  const { data: loanoutData, error } = await supabase
    .from('loanout_table')
    .insert({
      id,
      loanout_id,
      loanout_name,
      loanout_type,
      loanout_brand,
      loanout_number,
      loanout_time,
      loanout_user,
      loanout_remark,
      value
    })
  if (error) throw error
  return loanoutData
}

export const updateLoanOutTableData = async ({
  id,
  loanout_number,
  loanout_remark
}) => {
  const { data, error } = await supabase
    .from('loanout_table')
    .update({
      loanout_number,
      loanout_remark,
    })
    .eq('id', id)

  if (error) throw error
  return data
}

export const deleteLoadoutTableData = async (id: string) => {
  const { error } = await supabase
    .from('loanout_table')
    .delete()
    .eq('loanout_id', id)

  if (error) throw error
}

// search
export const searchInventoryTableData = async (
  type?: string | null, searchText?: string | null
) => {
  if (type && !searchText) {
    const { data, error } = await supabase
      .from('it_assets')
      .select('*')
      .eq('product_type', type)

    if (error) throw error
    return data
  } else if (!type && searchText) {
    const { data, error } = await supabase
      .from('it_assets')
      .select('*')
      .eq('product_name', `${searchText}`)

    if (error) throw error
    return data
  } else if (type && searchText) {
    const { data, error } = await supabase
      .from('it_assets')
      .select('*')
      .eq('product_type', type)
      .eq('product_name', `${searchText}`)

    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('it_assets')
      .select('*')

    if (error) throw error
    return data
  }
}

// search loanout
export const searchLoanoutTableData = async (
  type?: string | null, searchText?: string | null
) => {
  if (type && !searchText) {
    const { data, error } = await supabase
      .from('loanout_table')
      .select('*')
      .eq('loanout_type', type)

    if (error) throw error
    return data
  } else if (!type && searchText) {
    const { data, error } = await supabase
      .from('loanout_table')
      .select('*')
      .eq('loanout_name', `${searchText}`)

    if (error) throw error
    return data
  } else if (type && searchText) {
    const { data, error } = await supabase
      .from('loanout_table')
      .select('*')
      .eq('loanout_type', type)
      .eq('loanout_name', `${searchText}`)

    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('loanout_table')
      .select('*')

    if (error) throw error
    return data
  }
}