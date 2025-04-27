"use client"
import React, { useState, useEffect } from 'react';
import { UserOutlined, RobotOutlined, SmileOutlined, DeleteFilled } from '@ant-design/icons';
import { Flex, Button } from 'antd';
import type { GetProp, GetRef } from 'antd';
import { Bubble, Sender } from '@ant-design/x';
import ReactMarkdown from 'react-markdown';
import { insertAiHistoryWord } from '@/utils/pubAiHistory'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';

// 添加思考动画的样式
const thinkingStyle = `
  <style>
    .thinking {
      display: inline-block;
    }
    .dot-animation {
      display: inline-block;
      animation: dotAnimation 1.5s infinite;
    }
    @keyframes dotAnimation {
      0% { opacity: 0.2; }
      20% { opacity: 1; }
      100% { opacity: 0.2; }
    }
    
    /* Markdown 样式 */
    .markdown-content {
      width: 100%;
    }
    .markdown-content pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
    .markdown-content code {
      font-family: monospace;
    }
    .markdown-content p {
      margin: 8px 0;
    }
    .markdown-content h1, .markdown-content h2, .markdown-content h3, 
    .markdown-content h4, .markdown-content h5, .markdown-content h6 {
      margin-top: 16px;
      margin-bottom: 8px;
    }
    .markdown-content ul, .markdown-content ol {
      padding-left: 20px;
    }
    .markdown-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
    }
    .markdown-content th, .markdown-content td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    .markdown-content th {
      background-color: #f2f2f2;
    }
    .markdown-content blockquote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin-left: 0;
      color: #666;
    }
    .markdown-content img {
      max-width: 100%;
    }
    .markdown-content hr {
      border: 0;
      border-top: 1px solid #eee;
      margin: 16px 0;
    }
    .markdown-content a {
      color: #1890ff;
      text-decoration: none;
    }
    .markdown-content a:hover {
      text-decoration: underline;
    }
  </style>
`;

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  user: {
    placement: 'start',
    avatar: {
      icon: <UserOutlined />,
      style: {
        background: '#87d068'
      }
    },
    header: <span className='text-gray-500 font-bold text-[15px]'>aosang</span>
  },

  ai: {
    placement: 'start',
    avatar: {
      icon: <RobotOutlined />,
      style: {
        background: '#fde3cf'
      }
    },
    header: <span className='text-gray-600 font-bold text-[15px]'>yunsoo</span>
  }
}

// 移除防抖函数，改为节流函数
function throttle(func: Function, limit: number) {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number = 0;
  return function(this: any, ...args: any[]) {
    const context = this;
    const now = Date.now();
    if (!lastRan) {
      func.apply(context, args);
      lastRan = now;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((now - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = now;
        }
      }, limit - (now - lastRan));
    }
  };
}

const App: React.FC = () => {
  // test data
  const testData = [{
    id: 1,
    name: 'listitem123'
  }, {
    id: 2,
    name: 'listitem1231231233123123333000000'
  }]

  const [value, setValue] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [isCancelled, setIsCancelled] = useState<boolean>(false)
  const [messages, setMessages] = useState<Array<{ key: string, role: 'user' | 'ai', content: string | React.ReactNode }>>([
    {
      key: 'welcome',
      role: 'ai',
      content: '你好，我是AI助手，有什么可以帮你的吗？',
    }
  ])
  const listRef = React.useRef<GetRef<typeof Bubble.List>>(null)

  const requestContent = (content: string) => {
    // 重置取消标志
    setIsCancelled(false);
    
    // 先添加用户消息
    const userMessage: { key: string; role: 'user' | 'ai'; content: string } = {
      key: `user-${Date.now()}`,
      role: 'user',
      content: content,
    }

    // 创建AI消息的key
    const aiMessageKey = `ai-${Date.now()}`;

    // 先更新消息列表，添加用户消息和思考中的AI消息
    setMessages([
      ...messages,
      userMessage,
      {
        key: aiMessageKey,
        role: 'ai',
        content: <span
          className="thinking text-gray-800 font-bold text-[15px]">
          正在思考中
          <span className="dot-animation">...</span>
        </span>,
      }
    ]);
    setLoading(true)

    // 创建累积的内容变量
    let accumulatedContent = '';
    
    // 创建新的 AbortController
    const controller = new AbortController();
    setAbortController(controller);
    
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "model": process.env.NEXT_PUBLIC_API_MODEL,
        "messages": [
          { "role": "system", "content": `
            # 角色
            你是一位拥有多年经验的资深运维工程师，对软件运维和硬件运维都有深入的了解
            ## 任务要求
            1. 根据用户的问题，给出详细的回答
            2. 回答的内容需要包含详细的步骤和操作方法
            3. 回答的内容要调理清晰
            ## 注意：
            如果用户的问题与运维无关，请直接回答："抱歉，我无法回答这个问题。"
          ` },
          { "role": "user", "content": content }
        ],
        "stream": true,
        "max_tokens": parseInt(process.env.NEXT_PUBLIC_MAX_TOKENS || "2048"),
        "stop": null,
      }),
      signal: controller.signal // 添加信号,用于取消请求
    }

    fetch(process.env.NEXT_PUBLIC_API_URL || '', options)
      .then(response => {
        if (!response.ok) {
          throw new Error('网络响应不正常');
        }

        // 获取响应的reader
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('无法获取响应流');
        }
        
        // 更新消息内容的函数
        const updateMessageContent = (content: string) => {
          // 如果已取消，不再更新UI
          if (isCancelled) return;
          
          setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            for (let i = newMessages.length - 1; i >= 0; i--) {
              if (newMessages[i].key === aiMessageKey) {
                newMessages[i].content = (
                  <div className="markdown-content">
                    <ReactMarkdown
                      components={{
                        code({node, className, children, ...props}: any) {
                          const match = /language-(\w+)/.exec(className || '')
                          const inline = (props as any).inline;
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          )
                        }
                      }}
                      remarkPlugins={[remarkGfm]}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                );
                break;
              }
            }
            return newMessages;
          });
          
          // 确保内容更新后滚动到底部
          setTimeout(() => {
            listRef.current?.scrollTo({ offset: 9999 });
          }, 10);
        };
        
        // 使用节流函数
        const throttledUpdate = throttle(updateMessageContent, 50);
        
        function processStream() {
          // 检查取消状态
          if (isCancelled) {
            reader?.cancel().catch(console.error);
            return Promise.resolve();
          }
          
          return reader!.read().then(({ done, value }) => {
            // 如果已取消或完成，停止处理
            if (done || isCancelled) {
              // 确保最后的内容被更新
              updateMessageContent(accumulatedContent);
              setLoading(false);
              return;
            }
            
            try {
              // 将二进制数据转换为文本
              const chunk = new TextDecoder().decode(value);

              // 处理SSE格式的数据
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                  try {
                    const jsonStr = line.substring(6).trim(); // 移除 'data: ' 前缀并去除空白
                    // 检查JSON字符串是否有效
                    if (!jsonStr || jsonStr === '') continue;
                    
                    const jsonData = JSON.parse(jsonStr);
                    
                    // 提取内容
                    const content = jsonData.choices?.[0]?.delta?.content || '';
                    if (content) {
                      accumulatedContent += content;
                      // 使用节流更新，保持流畅的更新频率
                      throttledUpdate(accumulatedContent);
                    }
                  } catch (e) {
                    console.error('解析JSON失败:', e, '原始数据:', line);
                    // 继续处理下一行，不中断流程
                    continue;
                  }
                }
              }

              // 继续处理流，但先检查是否已取消
              if (!isCancelled) {
                return processStream();
              }
            } catch (error) {
              console.error('处理流数据时出错:', error);
              setLoading(false);
              // 更新为错误消息
              setMessages(prevMessages => {
                const newMessages = [...prevMessages];
                for (let i = newMessages.length - 1; i >= 0; i--) {
                  if (newMessages[i].key === aiMessageKey) {
                    newMessages[i].content = '抱歉，处理响应时出错了，请稍后再试。';
                    break;
                  }
                }
                return newMessages;
              })
            }
          });
        }

        return processStream();
      })
      .catch(err => {
        // 如果是取消请求导致的错误，不显示错误消息
        if (err.name === 'AbortError') {
          console.log('请求已取消');
          return;
        }
        
        console.error('请求出错:', err);
        // 更新为错误消息
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          // 找到最后一条AI消息并更新为错误信息
          for (let i = newMessages.length - 1; i >= 0; i--) {
            if (newMessages[i].key === aiMessageKey) {
              newMessages[i].content = '抱歉，请求出错了，请稍后再试。';
              break;
            }
          }
          return newMessages;
        });
        // 确保在错误情况下也将loading设置为false
        setLoading(false)
      })

    setValue('')
  }

  const stopRequestAi = () => {
    if (abortController) {
      // 设置取消标志
      setIsCancelled(true);
      
      // 中止请求
      abortController.abort();
      setAbortController(null);
      
      // 将 loading 状态设置为 false
      setLoading(false);
      
      console.log('已停止 AI 输出');
    }
  }

  const insertKeyWords = () => {
    let text = '添加关键词'
    insertAiHistoryWord(text)
  }

  useEffect(() => {
    document.title = 'AI助手'
  }, []); // 添加空依赖数组，避免重复执行

  return (
    <>
      <Button type="primary" onClick={insertKeyWords}>添加关键词</Button>
      <div className='
        w-[1200px]
        min-h-[85%]
        mx-auto 
        bg-white 
        p-4 
        rounded-lg 
        box-border
        flex-1
        overflow-hidden
        flex
        fixed
        top-2
        left-[50%]
        transform
        -translate-x-1/2
        justify-around
      '>
        <ul className='w-[22%] text-[14px] border-r-2 border-gray-200'>
          {testData.map((item) => {
            return (
              <li key={item.id} className='h-[40px] w-[90%] flex items-center'
              >
                <span className='leading-9 w-[150px] text-ellipsis whitespace-nowrap overflow-hidden'>{item.name}</span>
                <span className='ml-auto cursor-pointer'><DeleteFilled /></span>
            </li>
            )
          })}
        </ul>
        <div className='w-[70%]'>
          <div dangerouslySetInnerHTML={{ __html: thinkingStyle }} />
          <Flex gap="middle" vertical>
            <Bubble.List
              ref={listRef}
              style={{ maxHeight: '700px' }} // 修正高度单位
              roles={roles}
              items={messages}
              autoScroll
            />
          </Flex>
        </div>
      </div>
      <Sender
        prefix={<SmileOutlined />}
        classNames={{ prefix: 'my-sender'}}
        styles={{ prefix: { position: 'relative', bottom: '6px' } }}
        footer={<div className='text-xs text-gray-400'>yunsoo也可能会犯错，请务必核查重要信息。</div>}
        className='
        fixed 
        bottom-[3%] 
        left-0 
        right-0 
        w-[1200px] 
        mx-auto
        bg-white
      '
        autoSize={{ minRows: 1, maxRows: 3 }}
        onSubmit={requestContent}
        value={value}
        onChange={(v) => { setValue(v) }}
        onCancel={stopRequestAi}
        loading={loading}
        readOnly={loading}
      />
    </>

  )
}

export default App;