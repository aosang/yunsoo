'use client'
import { useEffect, useState } from "react"
import { Card, Col, Row, Input, Upload, Image, Button, Skeleton } from "antd"
import { RiDeleteBin5Fill } from "react-icons/ri"
import { IoEyeSharp } from "react-icons/io5"
import { getTimeNumber } from "@/utils/pubFunProvider"
import { supabase } from "@/utils/clients"
import { getProfiles, updateProfiles, getSession } from "@/utils/providerSelectData"
import useMessage from '@/utils/message'
import dayjs from "dayjs"
import { 
  PlusOutlined, 
  InfoCircleFilled,
} from '@ant-design/icons'

type myProfileInfoProps = {
  email: string,
  created_at: string,
  username: string,
  company: string,
  avatar_url?: string
}

const Profile = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [removePath, setRemovePath] = useState('')
  const [myProfileInfo, setMyProfileInfo] = useState<myProfileInfoProps>({
    email: '',
    created_at: '',
    username: '',
    company: '',
    avatar_url: ''
  })

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div className="ant-upload-text">上传头像</div>
    </button>
  )

  // upload images
  const uploadAvatarImage = async (e: any) => {
    let file = e.file
    let fileExt = file.name.split('.').pop()
    let filePath = (`${getTimeNumber()[1]}.${fileExt}`)
    setRemovePath(filePath)

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (error) {
      useMessage(2, error.message, 'error')
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setImageUrl(publicUrl)
      setMyProfileInfo({ ...myProfileInfo, avatar_url: publicUrl })
    }
  }

  // get user infomation
  const getUserInfo = () => {
    getSession().then(res => {
      let userId = res!.session?.user.id
      setUserId(userId as string)
      let formData = {
        username: res!.session?.user.user_metadata.username || '',
        company: res!.session?.user.user_metadata.company || '',
        email: res!.session?.user.email || '',
        created_at: dayjs(res!.session?.user.created_at).format('YYYY-MM-DD HH:mm:ss') || ''
      }
      setMyProfileInfo(formData)
      updateProfiles(userId!, formData)
      setIsLoading(false)
    })

  }

  const changeUsernameValue = (e: any) => {
    setMyProfileInfo({
      ...myProfileInfo,
      username: e.target.value
    })
  }

  const changeCompanyValue = (e: any) => {
    setMyProfileInfo({
      ...myProfileInfo,
      company: e.target.value
    })
  }

  const updateProfileInfo = () => {
    updateProfiles(userId, myProfileInfo)
      .then(res => {
        getProfiles()
        window.location.reload()
      })
  }

  const deleteAvatarsImages = async (e: any) => {
    e.stopPropagation()

    const { data, error } = await supabase.storage
      .from('avatars')
      .remove([removePath])

    if (error) {
      useMessage(2, error.message, 'error')
    } else {
      setImageUrl('')
      setRemovePath('')
      useMessage(2, '删除头像成功!', 'success')
    }
  }

  useEffect(() => {
    document.title = '个人设置'
    getUserInfo()
  }, [])


  return (
    <div className="p-3">
      <Card title="个人信息">
        <Skeleton active loading={isLoading} paragraph={{ rows: 6 }}>
          <Row gutter={30}>
            <Col span={12}>
              <div className="mb-5">
                <label htmlFor="Email" className="font-semibold mb-1">电子邮箱</label>
                <Input type="text" value={myProfileInfo.email} readOnly />
              </div>
              <div className="mb-5">
                <label htmlFor="CreateTime" className="font-semibold mb-1">创建时间</label>
                <Input type="text" value={myProfileInfo.created_at} readOnly  />
              </div>
              <div className="mb-5">
                <label htmlFor="Username" className="font-semibold mb-1">用户名</label>
                <Input
                  type="text"
                  value={myProfileInfo.username}
                  onChange={changeUsernameValue}
                  readOnly
                />
              </div>
              <div className="mb-5">
                <label htmlFor="Company" className="font-semibold mb-1">公司名称</label>
                <Input
                  type="text"
                  value={myProfileInfo.company}
                  onChange={changeCompanyValue}
                  readOnly
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="flex items-center pl-6">
                {imageUrl &&
                  <div>
                    <label htmlFor="avatar" className="font-semibold">Avatar</label>
                    <Image
                      src={imageUrl}
                      width={108}
                      height={108}
                      alt="avatar"
                      className="rounded-md"
                      preview={{
                        mask:
                          <div
                            className="ant-image-preview-mask flex items-center"
                          >
                            <IoEyeSharp className=" text-white text-lg mr-2" />
                            <RiDeleteBin5Fill onClick={deleteAvatarsImages} className="text-white text-lg" />
                          </div>
                      }}
                    />
                  </div>
                }
                {/* upload avatar image */}
                <Upload
                  listType="picture-card"
                  className="mt-3 ml-4"
                  customRequest={uploadAvatarImage}
                  maxCount={1}
                  showUploadList={false}
                >
                  {uploadButton}
                </Upload>
              </div>
              <p
                className="text-sm text-gray-400 flex pl-6 mt-2 ml-1 items-center">
                <span className="text-orange-600 text-base mr-1">
                  <InfoCircleFilled />
                </span>
                支持JPG和PNG格式，最大上传大小为2MB。
              </p>
            </Col>
          </Row>
          <div className="flex mt-3">
            <Button type="primary" onClick={updateProfileInfo}>保存</Button>
          </div>
        </Skeleton>
      </Card>
    </div>
  )
}

export default Profile