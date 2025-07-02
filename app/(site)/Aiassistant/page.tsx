"use client"
import React, { useState, useEffect } from 'react';
import {
  UserOutlined,
  SmileOutlined,
  FireOutlined,
} 
from '@ant-design/icons';
import { Flex, Space, ConfigProvider, theme, Skeleton} from 'antd';
import type { GetProp, GetRef } from 'antd';
import { Bubble, Sender, Prompts } from '@ant-design/x';
import type { PromptsProps } from '@ant-design/x'
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import { getAiHistoryWord } from '@/utils/pubFunProvider';
import Transation from '../components/Transation';

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
    header: <span className='text-gray-500 font-bold text-[15px]'>User</span>
  },

  ai: {
    placement: 'start',
    avatar: {
      icon: <img src='https://www.wangle.run/company_icon/public_image/assets_logo_white.png' alt='yunsoo' className='!w-[20px] !h-[20px]' />,
      style: { background: 'rgba(22, 119, 255, 0.65)' }
    },
    header: <span className='text-gray-600 font-bold text-[15px]'>yunsoo</span>
  }
}

// 移除防抖函数，改为节流函数
function throttle(func: Function, limit: number) {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number = 0;
  return function (this: any, ...args: any[]) {
    const context = this;
    const now = Date.now();
    if (!lastRan) {
      func.apply(context, args);
      lastRan = now;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if ((now - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = now;
        }
      }, limit - (now - lastRan));
    }
  };
}

const renderTitle = (icon: React.ReactElement, title: string) => (
  <Space align="start">
    {icon}
    <span>{title}</span>
  </Space>
)

const AiAssitant: React.FC = () => {
  const [isSkeletonLoading, setIsSkeletonLoading] = useState<boolean>(true)
  const [value, setValue] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [isCancelled, setIsCancelled] = useState<boolean>(false)
  const [keywords, setKeywords] = useState<Array<{ key: string, description: string }>>([])
  const [contextMessages, setContextMessages] = useState<Array<{ role: string, content: string }>>([
    { role: "system", content: `
      # 角色
      你是一位拥有多年经验的资深运维工程师，对软件运维和硬件运维都有深入的了解
      ## 任务要求
      1. 根据用户的问题，给出详细的回答
      2. 回答的内容需要包含详细的步骤和操作方法
      3. 回答的内容要调理清晰
      4. 回答的内容尽量减少代码，最好是以文字为主，如果需要代码，请尽量减少代码量，不要出现乱码，乱行，乱字符或随意换行缩进
      ## 注意：
      如果用户的问题与运维无关，请直接回答："抱歉，我无法回答这个问题。"
    ` }
  ]);
  const [messages, setMessages] = useState<Array<{ key: string, role: 'user' | 'ai', content: string | React.ReactNode }>>([
    {
      key: 'welcome',
      role: 'ai',
      content: '你好，我是yunsoo小助手，关于运维方面的问题，我可以帮你解答。',
    }
  ])

  const items: PromptsProps['items'] = [{
    key: '1',
    label: renderTitle(<FireOutlined style={{ color: '#FF4D4F' }} />, '热门运维知识'),
    description: '你感兴趣的是什么？',
    children: keywords.map(item => ({
      key: item.key,
      description: item.description,
    }))
  }]
  
  const listRef = React.useRef<GetRef<typeof Bubble.List>>(null)

  // 添加窗口高度状态
  const [windowHeight, setWindowHeight] = useState<number>(0);
  
  // 监听窗口大小变化
  useEffect(() => {
    // 初始化窗口高度
    setWindowHeight(window.outerHeight);
    
    const handleResize = () => {
      setWindowHeight(window.outerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // 计算 Bubble.List 的高度
  const getBubbleListHeight = () => {
    // 在低分辨率下降低高度
    if (windowHeight <= 728) {
      return '420px'; // 低分辨率下的高度
    } else if (windowHeight <= 900) {
      return '560px'; // 中等分辨率下的高度
    } else {
      return '730px'; // 高分辨率下的高度
    }
  };

  // 计算 Prompts 的高度
  const getPromptsHeight = () => {
    if (windowHeight <= 728) {
      return '84vh'; // 低分辨率下的高度
    } else if (windowHeight <= 900) {
      return '87.5vh'; // 中等分辨率下的高度
    } else {
      return '87.5vh'; // 高分辨率下的高度
    }
  };

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

    // 更新上下文消息
    const updatedContextMessages = [...contextMessages, { role: "user", content }];
    setContextMessages(updatedContextMessages);

    // 创建累积的内容变量
    let accumulatedContent = '';

    // 创建新的 AbortController
    const controller = new AbortController();
    setAbortController(controller);

    // 计算当前上下文的token数量（粗略估计）
    const estimateTokens = (text: string) => {
      // 英文大约每4个字符1个token，中文每个字符约1.5个token
      // 这是一个粗略估计，实际情况会有所不同
      const englishChars = text.match(/[a-zA-Z0-9.,?!;:'"()\[\]{}]/g)?.length || 0;
      const chineseChars = text.match(/[\u4e00-\u9fa5]/g)?.length || 0;
      const otherChars = text.length - englishChars - chineseChars;
      
      return Math.ceil(englishChars / 4 + chineseChars * 1.5 + otherChars);
    };
    
    // 计算上下文消息的总token数
    let contextTokens = 0;
    updatedContextMessages.forEach(msg => {
      contextTokens += estimateTokens(msg.content);
    });
    
    // 计算剩余可用的token数量，确保至少有1000个token用于回复
    const maxModelTokens = parseInt(process.env.NEXT_PUBLIC_MAX_TOKENS || "8192");
    const availableTokens = Math.max(1000, maxModelTokens - contextTokens);

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "model": process.env.NEXT_PUBLIC_API_MODEL,
        "messages": updatedContextMessages, // 使用上下文消息
        "stream": true,
        "max_tokens": availableTokens, // 动态计算可用的token数量
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
                        code({ node, className, children, ...props }: any) {
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
              
              // 将AI回复添加到上下文中
              if (accumulatedContent) {
                setContextMessages(prev => [...prev, { role: "assistant", content: accumulatedContent }]);
              }
              
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
        })
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

  useEffect(() => {
    document.title = 'AI助手'
    getAiHistoryWord().then(res => {
      setKeywords(res)
      setIsSkeletonLoading(false)
    })
  }, []); // 添加空依赖数组，避免重复执行

  return (
    <>
      <Transation />
      <div className='
        w-[1200px]
        h-[97.5vh]
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
        <div className='border-r-2 border-gray-200 w-[280px]'>
          <Skeleton active loading={isSkeletonLoading} paragraph={{ rows: 16 }} className='w-[246px]'>
            <div className='w-[160px] mb-5 ml-[40px]'>
              <img src="https://www.wangle.run/company_icon/public_image/load-blue.png" alt="logo" className='w-[100%]' />
            </div>
            <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
              <Prompts
                items={items}
                wrap
                styles={{
                  item: {
                    width: '246px',
                    flex: 'none',
                    backgroundImage: `linear-gradient(137deg, #e5f4ff 0%, #efe7ff 100%)`,
                    border: 0,
                    height: getPromptsHeight(), // 使用动态计算的高度
                    padding: '24px',
                    boxSizing: 'border-box',
                    margin: '0',
                  },
                  subItem: {
                    background: 'rgba(255,255,255,0.45)',
                    border: '1px solid #FFF',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  },
                }}
                onItemClick={(info) => {
                  if (!loading) {
                    requestContent(info.data.description as string)
                  }
                }}
              />
            </ConfigProvider>
          </Skeleton>
        </div>
        <div className='w-[70%]'>
          <div dangerouslySetInnerHTML={{ __html: thinkingStyle }} />
          <Flex gap="middle" vertical>
            <Bubble.List
              ref={listRef}
              style={{ maxHeight: getBubbleListHeight() }} // 使用动态计算的高度
              roles={roles}
              items={messages}
              autoScroll
            />
          </Flex>
          <Sender
            prefix={<SmileOutlined />}
            classNames={{ prefix: 'my-sender' }}
            styles={{ prefix: { position: 'relative', bottom: '6px' } }}
            footer={<div className='text-xs text-gray-400'>yunsoo也可能会犯错，请务必核查重要信息。</div>}
            className='
              fixed 
              bottom-[3%] 
              w-[68.5%]
              mx-auto
              bg-white'
            autoSize={{ minRows: 1, maxRows: 2 }}
            onSubmit={requestContent}
            value={value}
            onChange={(v) => { setValue(v) }}
            onCancel={stopRequestAi}
            loading={loading}
            readOnly={loading}
          />
        </div>
      </div>
    </>

  )
}

export default AiAssitant;