import { message } from 'antd'
import { NoticeType } from 'antd/es/message/interface'


const showMessage = (time:number, text:string, type:NoticeType) => {
  message.open({
    duration: time,
    content: text,
    type: type,
  })
}

export default showMessage