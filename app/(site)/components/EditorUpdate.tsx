import { useState, useEffect } from "react"
import { Editor, Toolbar, } from "@wangeditor/editor-for-react"
import { Row, Col, Input, Select, Divider, Button  } from "antd"
import { supabase } from "@/utils/clients"
import { getTimeNumber } from "@/utils/pubFunProvider"
import { knowledgeTypeItem, typeDataName} from "@/utils/dbType"
import { getWorkOrderType } from "@/utils/providerSelectData"
import { updateLibraryTableData } from "@/utils/provideLibraryData"
import useMessage from "@/utils/message"
import { IDomEditor, IToolbarConfig, i18nChangeLanguage } from '@wangeditor/editor'
i18nChangeLanguage('en')
import '@wangeditor/editor/dist/css/style.css'

const EditorPage = ({isEdit, setIsEdit, onSubmit, editInfo}: {
    isEdit: boolean,
    editInfo: any,
    setIsEdit: (isEdit: boolean) => void, 
    onSubmit: () => void, 
  }) => {
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  const [html, setHtml] = useState('')
  const [knowledgeType, setKnowledgeType] = useState<typeDataName[]>([])
  const [knowledgeItem, setKnowledgeItem] = useState<knowledgeTypeItem>({
    id: '',
    title: '',
    author: '',
    type: null,
    created_time: getTimeNumber()[0],
    content: '',
    description: ''
  })

  const editorConfig = {
    placeholder: "Write something...",
    MENU_CONF: {
      uploadImage: {
        async customUpload(files: any, insertFn: (url: string) => void) {
          let file = files.name
          let fileExt = file.split('.').pop()
          let filePath = (`${getTimeNumber()[1]}.${fileExt}`)

          const imageUrl = await handleImageUpload(filePath, files)
          insertFn(imageUrl)
        }
      }
    }
  }

  const toolbarConfig: Partial<IToolbarConfig> = {
    toolbarKeys: [
      'bold', // 加粗
      'italic', // 斜体
      'underline', // 下划线
      'uploadImage',
      // "insertImage",
      'color',
      'bgColor',
      'fontSize',
      'lineHeight',
      'clearStyle',
      'blockquote',
      'insertLink',
      'justifyLeft',
      'justifyCenter',
      'justifyRight',
      'headerSelect'
    ],
  }

  const handleImageUpload = async (file: any, obj:any) => {
    // Supabase 
    try {
      const { data, error } = await supabase.storage
        .from('knowledge_image') // bucket name
        .upload(file, obj);

      if (error) {
        console.error('Image upload error:', error);
        return '';
      }

      // public image URL
      const {data: {publicUrl}}  = supabase.storage.from('knowledge_image').getPublicUrl(file)

      // return imageURL to the WangEditor
      return publicUrl
      // console.log(publicUrl);
      
    } catch (error) {
      console.error('Error uploading image:', error)
      return ''
    }
  }

  const getWorkType = () => {
    getWorkOrderType().then(res => { 
      setKnowledgeType(res as [])
    })
  }

  const changeTitleValue = (e: any) => {
    setKnowledgeItem({
      ...knowledgeItem,
      title: e.target.value
    })
  }

  const changeDescriptionValue = (e: any) => {
    setKnowledgeItem({
      ...knowledgeItem,
      description: e.target.value
    })
  }

  const changeTypeLibrary = (value: string) => {
    setKnowledgeItem({
      ...knowledgeItem,
      type: value
    })
  }

  const changeLibraryContent = (editor: any) => {
    // console.log(editor.getAllMenuKeys());
    const newHtml = editor.getHtml()
    setHtml(newHtml)
    setKnowledgeItem(prevState => ({
      ...prevState,
      content: newHtml
    }))
  }

  const updateKnowledgeLibrarys = () => {
    const {title, type, content, description} = knowledgeItem
    if(title === '' || type === null || description === '') { 
      useMessage(2, 'Please fill in the title, type and description', 'error')
    } else if(content === '<p><br></p>') {
      useMessage(2, 'Please fill in the content', 'error')
    } else {
      updateLibraryTableData(knowledgeItem.id, knowledgeItem).then(res => {
        setKnowledgeItem({
          ...knowledgeItem,
          title: '',
          type: null,
          content: '',
          description: ''
        })
        setIsEdit(false)
        useMessage(2, 'update successful!', 'success')
        onSubmit()
      })
    }
  }

  const closeEditor = () => {
    setIsEdit(false)
    setKnowledgeItem({
      ...knowledgeItem,
      title: '',
      type: null,
      content: '',
      description: ''
    })
  }

  useEffect(() => {
    return () => {
      if (editor == null) return
      editor.destroy()
      setEditor(null)
    }
  }, [editor])

  
  useEffect(() => {
    setKnowledgeItem({
      ...knowledgeItem,
      id: editInfo[0].id,
      title: editInfo[0].title,
      author: editInfo[0].author,
      type: editInfo[0].type,
      created_time: getTimeNumber()[0],
      content: editInfo[0].content,
      description: editInfo[0].description
    })
    getWorkType()
  }, [editInfo])

  return (
    <>
      <div>
        {/* updated */}
        <Row gutter={16} className="mt-5">
          <Col span={12}>
            <label className="flex items-center font-semibold">
              <span className='mr-1 mb-1 text-red-600 font-thin'>*</span>
              Title
            </label>
            <Input
              showCount
              maxLength={60}
              value={knowledgeItem.title} 
              placeholder="Enter knowledge title"
              onChange={changeTitleValue}
            />
          </Col>
          <Col span={12}>
            <label className="flex items-center font-semibold">
              <span className='mr-1 mb-1 text-red-600 font-thin'>*</span>
              Description
            </label>
            <Input
              showCount
              maxLength={70}
              value={knowledgeItem.description} 
              placeholder="Enter knowledge title"
              onChange={changeDescriptionValue}
            />
          </Col>
        </Row>
        <Row gutter={16} className="mt-3">
          <Col span={8}>
            <label className="flex items-center font-semibold">
              <span className='mr-1 mb-1 text-red-600 font-thin'>*</span>
              更新时间
            </label>
            <Input value={knowledgeItem.created_time} readOnly />
          </Col>
          <Col span={8}>
            <label className="flex items-center font-semibold">
              <span className='mr-1 mb-1 text-red-600 font-thin'>*</span>
              作者
            </label>
            <Input value={knowledgeItem.author} readOnly />
          </Col>
          <Col span={8}>
            <label className="flex items-center font-semibold">
              <span className='mr-1 mb-1 text-red-600 font-thin'>*</span>
              类型
            </label>
            <Select 
              className="w-full"
              options={knowledgeType}
              placeholder="Knowledge type"
              allowClear
              onChange={changeTypeLibrary}
              value={knowledgeItem.type}
            />
          </Col>
        </Row>
        <div className="mt-3">
          <Toolbar
            defaultConfig={toolbarConfig}
            editor={editor}
            mode="default"
          />
          <Editor
            style={{height: '400px'}}
            defaultConfig={editorConfig}
            value={knowledgeItem.content}
            mode="default"
            onCreated={editor => setEditor(editor)}
            onChange={changeLibraryContent}
          />
        </div>
      </div>
      
      <Divider />
      <Button 
        type="default" 
        className="mr-3"
        onClick={() => {closeEditor()}}
      >
        关闭
      </Button>
      <Button 
        type="primary" 
        onClick={updateKnowledgeLibrarys}>
        确认更新
      </Button>

      {/* <div dangerouslySetInnerHTML={{__html: html}}></div> */}
    </>
  )
}

export default EditorPage