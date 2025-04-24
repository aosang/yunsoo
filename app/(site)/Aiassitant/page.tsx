"use client"
import React, { useState, useEffect } from 'react';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import type { GetProp, GetRef } from 'antd';
import { Bubble, Sender } from '@ant-design/x';
import ReactMarkdown from 'react-markdown';

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
  },

  ai: {
    placement: 'start',
    avatar: {
      icon: <RobotOutlined />,
      style: {
        background: '#fde3cf'
      }
    }
  }
}

// 添加自定义防抖函数
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  return function(...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

const App: React.FC = () => {
  const [value, setValue] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<Array<{ key: string, role: 'user' | 'ai', content: string | React.ReactNode }>>([
    {
      key: 'welcome',
      role: 'ai',
      content: '你好，我是AI助手，有什么可以帮你的吗？',
    }
  ])
  const listRef = React.useRef<GetRef<typeof Bubble.List>>(null)

  const requestContent = (content: string) => {
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
    const options = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer sk-apsnvgfxprqmsvacjrajtfinrvbyowwbeskipyzrjdogfyze',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "model": "Qwen/QwQ-32B",
        "messages": [{ "role": "user", "content": content }],
        "stream": true,
        "max_tokens": 512,
        "stop": null,
      })
    }

    fetch('https://api.siliconflow.cn/v1/chat/completions', options)
      .then(response => {
        if (!response.ok) {
          throw new Error('网络响应不正常');
        }

        // 获取响应的reader
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('无法获取响应流');
        }

        // 用于存储累积的AI回复
        let accumulatedContent = '';
        let isFirstChunk = true;
        
        // 创建一个单独的状态更新函数，与流处理分离
        const updateMessageContent = (content: string) => {
          setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            for (let i = newMessages.length - 1; i >= 0; i--) {
              if (newMessages[i].key === aiMessageKey) {
                newMessages[i].content = (
                  <div className="markdown-content">
                    <ReactMarkdown>
                      {content}
                    </ReactMarkdown>
                  </div>
                );
                break;
              }
            }
            return newMessages;
          });
        };
        
        // 使用防抖更新UI，减少渲染频率
        const debouncedUpdate = debounce(updateMessageContent, 200);
        
        // 处理数据流
        function processStream() {
          return reader!.read().then(({ done, value }) => {
            if (done) {
              // 确保最后一次更新被应用
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
                      // 使用防抖更新UI
                      debouncedUpdate(accumulatedContent);
                    }
                  } catch (e) {
                    console.error('解析JSON失败:', e, '原始数据:', line);
                    // 继续处理下一行，不中断流程
                    continue;
                  }
                }
              }

              // 继续处理流
              return processStream();
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
              });
            }
          });
        }

        return processStream();
      })
      .catch(err => {
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
        setLoading(false);
      });

    setValue('');
  }

  // 修改滚动逻辑
  useEffect(() => {
    const scrollToBottom = () => {
      if (listRef.current) {
        try {
          // 使用 setTimeout 延迟滚动，确保内容已渲染
          setTimeout(() => {
            listRef.current?.scrollTo({ offset: 99999 });
          }, 50);
        } catch (error) {
          console.error('滚动错误:', error);
        }
      }
    };
    
    // 只在消息数量变化时滚动
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    document.title = 'AI助手'
  }, []); // 添加空依赖数组，避免重复执行

  return (
    <>
      <div className='
      w-[800px] 
      mx-auto 
      bg-white 
      p-4 
      rounded-lg 
      box-border
     
    '>
        <div dangerouslySetInnerHTML={{ __html: thinkingStyle }} />
        <Flex gap="middle" vertical>
          <Bubble.List
            ref={listRef}
            style={{ maxHeight: '800px' }} // 修正高度单位
            roles={roles}
            items={messages}
            autoScroll
          />
        </Flex>

      </div>
      <Sender
        className='
      absolute 
      bottom-[15px] 
      left-0 
      right-0 
      w-[700px] 
      mx-auto'
        autoSize={{ minRows: 1, maxRows: 3 }}
        onSubmit={requestContent}
        value={value}
        onChange={(v) => { setValue(v) }}
        loading={loading}
        readOnly={loading}
      />
    </>

  )
}

export default App;