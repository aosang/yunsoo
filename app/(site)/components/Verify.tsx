'use client'
import { AiFillCheckCircle } from 'react-icons/ai'
import Link from 'next/link'
import { getEmailServerUrl } from '@/utils/emailCheck'

interface emailProps  {
  emailAddress: string
}

const emailBox: React.CSSProperties  = {
  width: '680px',
  margin: '60px auto 0 auto'
}

const emailTitle: React.CSSProperties  = {
  textAlign: 'center',
  fontSize: '20px',
  fontWeight: '600'
}

const emailContent: React.CSSProperties  = {
  fontSize: '16px'
}

const emailText: React.CSSProperties  = {
  color: '#1890ff',
  textDecoration: 'underline'
}

const Verify: React.FC<emailProps> = ({ emailAddress }) => {
  const emailUrl = getEmailServerUrl(emailAddress)

  return (
    <div style={emailBox}>
      <h3 style={emailTitle}>Email Confirm</h3>
      <AiFillCheckCircle style={{ 
        fontSize: '80px', 
        color: '#10ac84', 
        margin: '20px auto',
        textAlign: 'center' 
      }} />
      <p style={emailContent}>
        Click this link, fill out the information or join Assets-Management, then confirm your email.
      </p>
      <Link style={emailText} href={emailUrl}>
        Email address website
      </Link>
      <p></p>
    </div>
  )
}
 
export default Verify