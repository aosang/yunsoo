import { useLanguage } from "./LanguageContext"
import { Button } from "antd"
import {useEffect} from "react"

const LanguageSwitch = () => {
  const {locale, changeLanguage} = useLanguage()

  useEffect(() => {
    if (locale === 'en') {
      changeLanguage('zh');
    }   
  }, [])

  const toggleLanguage = () => {
    changeLanguage(locale === 'en'? 'zh' : 'en');
  }

  return (
    <Button onClick={toggleLanguage} size="small" className="mr-4">
      {locale === 'en' ? '中文' : 'English'}
    </Button>
  )
}

export default LanguageSwitch