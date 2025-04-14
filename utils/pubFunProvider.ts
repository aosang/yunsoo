import { supabase } from '@/utils/clients'
import useMessage from "@/utils/message"
import dayjs from "dayjs"

// 邮箱正则
let emailReg: RegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const emailRegFunc = (email: string) => {
  return emailReg.test(email)
}

// 密码正则
let passwordReg: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/
export const passwordRegFunc = (password: string) => {
  return passwordReg.test(password)
}

export const getTimeNumber = () => {
  let number: number = Math.floor(Math.random() * (99 - 10 + 1)) + 10
  let date = new Date()
  let y = date.getFullYear()
  let m = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
  let d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()

  let h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  let mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()

  let timeFilter = y + '-' + m + '-' + d + ' ' + h + ':' + mm + ':' + s
  timeFilter = dayjs(timeFilter).format('YYYY-MM-DD HH:mm:ss')
  let timeNumber = y + '' + m + '' + d + '' + h + '' + mm + '' + s + number

  let currentTime = dayjs(timeFilter).format('YYYY-MM-DD HH:mm:ss')
  return [timeFilter, timeNumber, currentTime]
}


export const getDeviceData = async (query?: string) => {
  if(query === '') {
    const { data, error } = await supabase.from('it_assets_cn')
    .select('*')
    .ilike('value', `%${query}%`)
    try {
      if (data) return data || []
      useMessage(2, error?.message, 'error')
    }
    catch (error) {
      throw error
    }
  }else {
    const { data, error } = await supabase.from('it_assets_cn').select('*')
    try {
      if (data) return data || []
      useMessage(2, error?.message, 'error')
    }
    catch (error) {
      throw error
    }
  } 
}
