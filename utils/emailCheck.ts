// checkEmail
export function getEmailServerUrl(email: string) {
  let serverMap = {
    'qq.com': 'https://mail.qq.com',
    'sina.com': 'https://mail.sina.com.cn',
    '163.com': 'https://mail.163.com',
    '126.com': 'https://mail.126.com',
    'gmail.com': 'https://www.google.com/gmail',
    'yahoo.com': 'https://login.yahoo.com/'
  }

  let emailServer = email.split('@')[1]
  return serverMap[emailServer] || ''
}

