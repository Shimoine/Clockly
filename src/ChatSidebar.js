import React, { useState, useRef, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import * as Blockly from 'blockly'

import generateAllBlocksXmlWithDTDWithTooltip, { generateAllBlocksXmlWithDTD } from './AllblockXmlWithDTDWithTooltip' // xml DTDありtooltipあり
import generateAllBlocksXmlWithDTDWithoutTooltip from './AllBlocksXmlWithDTDWithoutTooltip' // xml DTDありtooltipなし
import generateAllBlocksXml from './AllBlocksXml' // xml DTDなしtooltipあり
import generateAllBlocksXmlWithoutDTDWithoutTooltip from './AllBlocksXmlWithoutDTDWithoutTooltip' // xml DTDなしtooltipなし

// XMLを含むテキストを解析してXML部分と説明部分に分離する
function parseMessageWithXML(text) {
    const xmlRegex = /<xml[^>]*>[\s\S]*?<\/xml>/g
    const matches = [...text.matchAll(xmlRegex)]
    
    if (matches.length === 0) {
        return { hasXML: false, text }
    }
    
    // XMLブロックとテキストを順番に配列に格納
    const parts = []
    let lastIndex = 0
    
    matches.forEach((match, index) => {
        const xmlContent = match[0]
        const xmlStartIndex = match.index
        
        // XML前のテキスト
        const beforeText = text.substring(lastIndex, xmlStartIndex).trim()
        if (beforeText) {
            parts.push({ type: 'text', content: beforeText })
        }
        
        // XMLブロック
        parts.push({ type: 'xml', content: xmlContent })
        
        lastIndex = xmlStartIndex + xmlContent.length
    })
    
    // 最後のXML以降のテキスト
    const afterText = text.substring(lastIndex).trim()
    if (afterText) {
        parts.push({ type: 'text', content: afterText })
    }
    
    return { hasXML: true, parts }
}

// Blocklyワークスペースを表示するコンポーネント
function BlocklyPreview({ xmlContent, onAddToWorkspace, onReplaceWorkspace }) {
    const containerRef = useRef(null)
    const workspaceRef = useRef(null)

    useEffect(() => {
        if (!containerRef.current || !xmlContent) return

        // 既存のワークスペースをクリア
        if (workspaceRef.current) {
            workspaceRef.current.dispose()
            workspaceRef.current = null
        }

        try {
            const workspace = Blockly.inject(containerRef.current, {
                readOnly: true,
                scrollbars: true,
                zoom: {
                    controls: true,
                    wheel: false,
                    startScale: 0.8,
                    maxScale: 1.5,
                    minScale: 0.3,
                },
                move: {
                    scrollbars: true,
                    drag: true,
                    wheel: false
                }
            })
            workspaceRef.current = workspace

            const xmlDom = Blockly.utils.xml.textToDom(xmlContent)
            Blockly.Xml.domToWorkspace(xmlDom, workspace)

            setTimeout(() => {
                Blockly.svgResize(workspace)
                workspace.zoomToFit()
            }, 50)

            // ブロックを中央に配置
            const blocks = workspace.getTopBlocks()
            if (blocks.length > 0) {
                workspace.centerOnBlock(blocks[0].id)
            }
        } catch (error) {
            console.error('Failed to render Blockly XML:', error)
        }

        return () => {
            if (workspaceRef.current) {
                workspaceRef.current.dispose()
                workspaceRef.current = null
            }
        }
    }, [xmlContent])

    return (
        <div style={{ marginTop: '8px', marginBottom: '8px' }}>
            <div
                ref={containerRef}
                style={{
                    height: '200px',
                    width: '100%',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                }}
            />
            {(onAddToWorkspace || onReplaceWorkspace) && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                    {onAddToWorkspace && (
                        <Button
                            variant="success"
                            size="sm"
                            onClick={() => onAddToWorkspace(xmlContent)}
                            style={{ 
                                fontSize: '14px',
                                padding: '8px 16px'
                            }}
                        >
                            追加
                        </Button>
                    )}
                    {onReplaceWorkspace && (
                        <Button
                            variant="warning"
                            size="sm"
                            onClick={() => onReplaceWorkspace(xmlContent)}
                            style={{ 
                                fontSize: '14px',
                                padding: '8px 16px'
                            }}
                        >
                            置換
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}

// マークダウンをHTMLに変換する簡易関数
function markdownToHtml(text) {
    if (!text) return ''
    
    // **太字** を <strong>太字</strong> に変換
    text = text.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
    
    // *イタリック* を <em>イタリック</em> に変換（**の後に処理）
    text = text.replace(/\*([^\*]+)\*/g, '<em>$1</em>')
    
    // __太字__ を <strong>太字</strong> に変換
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>')
    
    // _イタリック_ を <em>イタリック</em> に変換
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>')
    
    // `コード` を <code>コード</code> に変換
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>')
    
    return text
}

function sanitizeHtml(dirty) {
	// 空値は空文字列を返す
	if (!dirty) return ''
	
	// マークダウンをHTMLに変換
	dirty = markdownToHtml(dirty)
	
	// DOMParserを利用してパース
	const parser = new DOMParser()
	const doc = parser.parseFromString(String(dirty), 'text/html')
	// 許可するタグ
	const ALLOWED = new Set(['BR','B','I','STRONG','EM','U','PRE','CODE','A','P','UL','OL','LI','SPAN'])
	// 再帰的にクリーンアップ
	function clean(node) {
		Array.from(node.childNodes).forEach(child => {
			if (child.nodeType === Node.ELEMENT_NODE) {
				if (!ALLOWED.has(child.tagName)) {
					// 許可されない要素はテキストに置換（タグを剥がす）
					const text = document.createTextNode(child.textContent || '')
					node.replaceChild(text, child)
				} else {
					// 許可された要素は属性を検査（A は href のみ許可）
					const attrs = Array.from(child.attributes || [])
					attrs.forEach(attr => {
						if (child.tagName === 'A' && attr.name === 'href') {
							const val = (attr.value || '').trim()
							// 安全なスキームのみ許可
							if (!/^(https?:\/\/|mailto:)/i.test(val)) {
								child.removeAttribute('href')
							}
						} else {
							child.removeAttribute(attr.name)
						}
					})
					// 子要素も再帰処理
					clean(child)
				}
			} else if (child.nodeType === Node.TEXT_NODE) {
				// テキストノードはそのまま
			} else {
				// その他のノードは除去
				node.removeChild(child)
			}
		})
	}
	clean(doc.body)
	let safe = doc.body.innerHTML || ''
	// 改行を <br/> に変換して反映（テキスト中の \n に対応）
	safe = safe.replace(/\r\n?/g, '\n').replace(/\n/g, '<br/>')
	return safe
}

export default function ChatSidebar({ workspace, ruleName, open = false, onOpenChange }) {
    const [chatMessages, setChatMessages] = useState([])
    const [chatInput, setChatInput] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const [chatController, setChatController] = useState(null)
    const [sessionId, setSessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    const [sessions, setSessions] = useState([])
    const [showHistory, setShowHistory] = useState(false)
    const textareaRef = useRef(null)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        const ta = textareaRef.current
        if (!ta) return
        ta.style.height = 'auto'
        const newHeight = Math.min(400, ta.scrollHeight)
        ta.style.height = `${newHeight}px`
    }, [chatInput])

    useEffect(() => {
        // メッセージが更新されたら自動的に最下部にスクロール
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [chatMessages])

    // セッション一覧を読み込む
    const loadSessions = async () => {
        try {
            const resp = await fetch('/chat-sessions')
            if (resp.ok) {
                const sessionList = await resp.json()
                setSessions(sessionList)
            }
        } catch (e) {
            console.error('Failed to load sessions:', e)
        }
    }

    // コンポーネントマウント時に会話履歴を読み込む
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const resp = await fetch(`/chat-history/${sessionId}`)
                if (resp.ok) {
                    const history = await resp.json()
                    setChatMessages(history)
                }
            } catch (e) {
                console.error('Failed to load chat history:', e)
            }
        }
        loadHistory()
        loadSessions()
    }, [sessionId])

    // 新規チャットを作成
    const createNewChat = () => {
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setSessionId(newSessionId)
        setChatMessages([])
        setShowHistory(false)
    }

    // セッションを切り替え
    const switchSession = (newSessionId) => {
        setSessionId(newSessionId)
        setShowHistory(false)
    }

    // セッションを削除
    const deleteSession = async (sessionIdToDelete, event) => {
        event.stopPropagation()
        if (!window.confirm('このチャット履歴を削除しますか？')) return

        try {
            const resp = await fetch(`/chat-history/${sessionIdToDelete}`, {
                method: 'DELETE'
            })
            if (resp.ok) {
                loadSessions()
                if (sessionIdToDelete === sessionId) {
                    createNewChat()
                }
            }
        } catch (e) {
            console.error('Failed to delete session:', e)
        }
    }

    const startChatStreaming = async (userMessage) => {
        if (!workspace) {
            setChatMessages(prev => [...prev, { role:'assistant', text:'[ワークスペースが未初期化です]' }])
            return
        }
        setIsStreaming(true)
        // ユーザーメッセージとアシスタントの空枠を一度に追加
        setChatMessages(prev => [...prev, { role:'user', text: userMessage }, { role:'assistant', text: '' }])

        let availableCalendars = [];
        const resp = await fetch('/calendar_list');
        if (resp.ok) {
            const list = await resp.json();
            availableCalendars = list.map(c => ({ summary: c.summary, id: c.id }));
        } else {
            availableCalendars = []; 
        }

        try {
            const currentXml = Blockly.Xml.workspaceToDom(workspace)
            currentXml.querySelectorAll('block, shadow').forEach(b => b.removeAttribute('id'))
            const currentXmlText = Blockly.Xml.domToText(currentXml)

            const requestData = {
                currentWorkspace: currentXmlText,
                xmlExample: generateAllBlocksXml(Blockly, workspace),
                ruleName,
                availableCalendars: availableCalendars,
                userMessage,
                sessionId
            }

            const controller = new AbortController()
            setChatController(controller)

            const resp = await fetch('/gemini-ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
                signal: controller.signal
            })

            if (!resp.ok) {
                const txt = await resp.text()
                setChatMessages(prev => [...prev, { role:'assistant', text:`[エラー] ${resp.status} ${txt}` }])
                setIsStreaming(false)
                setChatController(null)
                return
            }

            const reader = resp.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                
                const chunk = decoder.decode(value, { stream: true })
                buffer += chunk

                // SSE形式の「data: …\n\n」で分割処理
                const parts = buffer.split('\n\n')
                buffer = parts.pop() || ''

                for (const part of parts) {
                    if (!part.trim()) continue
                    
                    const lines = part.split('\n')
                    for (const line of lines) {
                        if (line.startsWith('data:')) {
                            const dataText = line.substring(5).trim()
                            
                            // 終了シグナルの場合
                            if (dataText === '[DONE]') {
                                setIsStreaming(false)
                                continue
                            }
                            
                            // JSONパース試行（サーバーがJSONエンコードしている場合）
                            let content = dataText
                            try {
                                content = JSON.parse(dataText)
                            } catch (e) {
                                // JSONでない場合はそのまま使用
                            }
                            
                            // エラーチェック
                            if (typeof content === 'object' && content.error) {
                                setChatMessages(prev => {
                                    const updated = [...prev]
                                    const last = updated[updated.length - 1]
                                    if (last && last.role === 'assistant') {
                                        updated[updated.length - 1] = {
                                            role: 'assistant',
                                            text: last.text + `[エラー: ${content.error}]`
                                        }
                                    }
                                    return updated
                                })
                                setIsStreaming(false)
                                continue
                            }
                            
                            // 最後のアシスタントメッセージに追記
                            setChatMessages(prev => {
                                const updated = [...prev]
                                const last = updated[updated.length - 1]
                                if (last && last.role === 'assistant') {
                                    updated[updated.length - 1] = {
                                        role: 'assistant',
                                        text: last.text + content
                                    }
                                } else {
                                    updated.push({ role: 'assistant', text: String(content) })
                                }
                                return updated
                            })
                        }
                    }
                }
            }

            // ストリーム終了を明示
            setIsStreaming(false)

        } catch (e) {
            if (e.name === 'AbortError') {
                setChatMessages(prev => [...prev, { role:'assistant', text:'[ストリーム中断]' }])
            } else {
                setChatMessages(prev => [...prev, { role:'assistant', text:`[通信エラー: ${e.message}]` }])
            }
        } finally {
            setIsStreaming(false)
            setChatController(null)
        }
    }

    const stopChatStreaming = () => {
        if (chatController) {
            try { chatController.abort() } catch (e) {}
        }
        setIsStreaming(false)
        setChatController(null)
    }

    const handleAddToWorkspace = (xmlContent) => {
        if (!workspace) {
            alert('ワークスペースが初期化されていません')
            return
        }

        try {
            const xmlDom = Blockly.utils.xml.textToDom(xmlContent)
            
            // 既存のブロックの最大Y座標を取得
            const existingBlocks = workspace.getTopBlocks()
            let maxY = 20
            existingBlocks.forEach(block => {
                const xy = block.getRelativeToSurfaceXY()
                const height = block.height
                if (xy.y + height > maxY) {
                    maxY = xy.y + height + 20
                }
            })

            // 追加前のブロック数を記録
            const beforeBlockIds = workspace.getTopBlocks().map(b => b.id)
            
            // XMLからブロックを追加
            Blockly.Xml.domToWorkspace(xmlDom, workspace)
            
            // 追加後に新しく追加されたブロックを取得
            const afterBlocks = workspace.getTopBlocks()
            const newBlocks = afterBlocks.filter(block => !beforeBlockIds.includes(block.id))
            
            // 追加したブロックを既存ブロックの下に配置
            if (newBlocks.length > 0) {
                newBlocks.forEach((block, index) => {
                    block.moveBy(20, maxY + (index * 100))
                })
                
                // 最初のブロックを中央に表示
                workspace.centerOnBlock(newBlocks[0].id)
            }

            alert('ワークスペースに追加しました')
        } catch (error) {
            console.error('Failed to add blocks to workspace:', error)
            alert('ブロックの追加に失敗しました: ' + error.message)
        }
    }

    const handleReplaceWorkspace = (xmlContent) => {
        if (!workspace) {
            alert('ワークスペースが初期化されていません')
            return
        }

        if (!window.confirm('現在のワークスペースの内容をすべて置き換えますか？')) {
            return
        }

        try {
            // ワークスペースをクリア
            workspace.clear()
            
            // 新しいXMLを読み込み
            const xmlDom = Blockly.utils.xml.textToDom(xmlContent)
            Blockly.Xml.domToWorkspace(xmlDom, workspace)
            
            // ブロックを中央に表示
            const blocks = workspace.getTopBlocks()
            if (blocks.length > 0) {
                workspace.centerOnBlock(blocks[0].id)
            }

            alert('ワークスペースを置き換えました')
        } catch (error) {
            console.error('Failed to replace workspace:', error)
            alert('ワークスペースの置き換えに失敗しました: ' + error.message)
        }
    }

    const panelWidth = 600
    const panelStyle = {
        position: 'fixed', right: 0, top: 60,
        height: 'calc(100vh - 80px)', width: panelWidth, maxWidth:'100%',
        background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.12)',
        borderRadius:'8px 0 0 8px',
        transform: open ? 'translateX(0)' : `translateX(${panelWidth}px)`,
        transition: 'transform 240ms ease-in-out',
        zIndex:2000, overflow:'hidden', display:'flex', flexDirection:'column'
    }
    const floatButtonStyle = {
        position:'fixed', right:24, bottom:24,
        width:56, height:56, borderRadius:'50%', background:'#0d6efd',
        color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 6px 18px rgba(13,110,253,0.24)', cursor:'pointer', zIndex:2100, border:'none'
    }

    return (
        <>
            {!open && (
                <button
                    aria-label="Open AI Chat"
                    title="AIと対話"
                    style={floatButtonStyle}
                    onClick={() => { if (typeof onOpenChange === 'function') onOpenChange(true) }}
                >
                    🤖
                </button>
            )}
            <div style={panelStyle} aria-hidden={!open}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderBottom:'1px solid #eee' }}>
                    <strong>AIアシスタント</strong>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <button
                            onClick={createNewChat}
                            style={{
                                border:'none', background:'transparent', cursor:'pointer',
                                fontSize:18, padding:'4px 8px', borderRadius:4,
                                display:'flex', alignItems:'center', justifyContent:'center'
                            }}
                            title="新規チャット"
                        >
                            ＋
                        </button>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            style={{
                                border:'none', background:'transparent', cursor:'pointer',
                                fontSize:18, padding:'4px 8px', borderRadius:4,
                                display:'flex', alignItems:'center', justifyContent:'center'
                            }}
                            title="履歴"
                        >
                            ⏲
                        </button>
                        <div style={{ width:'1px', height:'20px', background:'#ddd', margin:'0 4px' }}></div>
                        <button aria-label="Close chat" onClick={() => { if (typeof onOpenChange === 'function') onOpenChange(false) }} style={{ border:'none', background:'transparent', fontSize:20, cursor:'pointer' }}>×</button>
                    </div>
                </div>

                {showHistory ? (
                    <div style={{ padding:12, overflow:'auto', flex:1 }}>
                        <h3 style={{ fontSize:16, marginBottom:12 }}>チャット履歴</h3>
                        {sessions.length === 0 ? (
                            <p style={{ color:'#666', textAlign:'center', marginTop:20 }}>履歴がありません</p>
                        ) : (
                            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                {sessions.map(session => (
                                    <div
                                        key={session.id}
                                        onClick={() => switchSession(session.id)}
                                        style={{
                                            padding:'12px',
                                            border:'1px solid #ddd',
                                            borderRadius:8,
                                            cursor:'pointer',
                                            background: session.id === sessionId ? '#e3f2fd' : '#fff',
                                            transition:'background 0.2s',
                                            display:'flex',
                                            justifyContent:'space-between',
                                            alignItems:'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (session.id !== sessionId) {
                                                e.currentTarget.style.background = '#f5f5f5'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (session.id !== sessionId) {
                                                e.currentTarget.style.background = '#fff'
                                            }
                                        }}
                                    >
                                        <div style={{ flex:1, minWidth:0 }}>
                                            <div style={{ fontWeight:500, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                {session.title}
                                            </div>
                                            <div style={{ fontSize:12, color:'#666' }}>
                                                メッセージ数: {session.message_count}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => deleteSession(session.id, e)}
                                            style={{
                                                border:'none',
                                                background:'#ff4444',
                                                color:'#fff',
                                                borderRadius:4,
                                                padding:'4px 8px',
                                                cursor:'pointer',
                                                fontSize:12
                                            }}
                                            title="削除"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ padding:12, overflow:'auto', flex:1 }}>
                        <div style={{ minHeight:'100%', display:'flex', flexDirection:'column' }}>
                            <div style={{ flex:1, overflowY:'auto', marginBottom:10 }}>
                                {chatMessages.map((msg, index) => {
                                    const parsed = msg.role === 'assistant' ? parseMessageWithXML(msg.text) : { hasXML: false, text: msg.text }
                                    
                                    return (
                                        <div key={index} style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                            <div style={{ display:'inline-block', padding:'8px 12px', borderRadius:16, maxWidth:'80%', margin:'4px 0',
                                                backgroundColor: msg.role === 'user' ? '#dcf8c6' : '#f1f0f0', wordWrap:'break-word', whiteSpace:'pre-wrap', textAlign: 'left' }}>
                                                {!msg.text && isStreaming && index === chatMessages.length - 1 ? (
                                                    <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                                        思考中
                                                        <span style={{ 
                                                            display:'inline-block', 
                                                            width:'16px', 
                                                            height:'16px', 
                                                            border:'2px solid #ccc', 
                                                            borderTop:'2px solid #333',
                                                            borderRadius:'50%',
                                                            animation:'spin 1s linear infinite'
                                                        }} />
                                                    </span>
                                                ) : parsed.hasXML ? (
                                                    <>
                                                        {parsed.parts.map((part, partIndex) => (
                                                            part.type === 'text' ? (
                                                                <div key={partIndex} style={{ marginBottom: partIndex < parsed.parts.length - 1 ? '8px' : 0, marginTop: partIndex > 0 ? '8px' : 0 }} 
                                                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(part.content) }} />
                                                            ) : (
                                                                <BlocklyPreview 
                                                                    key={partIndex}
                                                                    xmlContent={part.content} 
                                                                    onAddToWorkspace={handleAddToWorkspace}
                                                                    onReplaceWorkspace={handleReplaceWorkspace}
                                                                />
                                                            )
                                                        ))}
                                                    </>
                                                ) : (
                                                    <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.text) }} />
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                                <style>{`
                                    @keyframes spin {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </div>
                            <div style={{ display:'flex', gap:8, alignItems:'flex-end', marginTop:8 }}>
                                <textarea
                                    ref={textareaRef}
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            if (chatInput.trim() !== '') {
                                                startChatStreaming(chatInput.trim())
                                                setChatInput('')
                                            }
                                        }
                                    }}
                                    placeholder="メッセージを入力… (Shift+Enterで改行)"
                                    disabled={isStreaming}
                                    style={{
                                        flex:1, minHeight:40, maxHeight:400, padding:'8px 10px',
                                        borderRadius:8, border:'1px solid #ced4da', boxSizing:'border-box',
                                        resize:'none', fontSize:14, lineHeight:'20px'
                                    }}
                                />
                                <div style={{ display:'flex', alignItems:'flex-end' }}>
                                    <Button
                                        variant={isStreaming ? 'danger' : 'outline-danger'}
                                        onClick={() => {
                                            if (isStreaming) stopChatStreaming()
                                            else if (chatInput.trim() !== '') { startChatStreaming(chatInput.trim()); setChatInput('') }
                                        }}
                                        disabled={!isStreaming && chatInput.trim() === ''}
                                        style={{ width:56, height:40, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:2 }}
                                        title={isStreaming ? '中止' : '送信'}
                                    >
                                        <span style={{ fontSize:18 }}>{isStreaming ? '⏹' : '▶'}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
