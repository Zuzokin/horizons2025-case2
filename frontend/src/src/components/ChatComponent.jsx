import React, { useState, useRef, useEffect } from 'react';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          stream: false,
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: `Ты — ассистент, который отвечает исключительно кратко, структурировано и по делу. 
              Отвечай тезисами (не более 5 пунктов), без объяснений и размышлений. Не используй нумерацию и не пиши служебные теги.`
            },
            {
              role: 'user',
              content: input +
                `. Пожалуйста, дай ответ в формате коротких тезисов, не более 5 пунктов, без дополнительных комментариев, без нумерации и тегов.`
            }
          ],
          max_tokens: 2000
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `Ошибка ${response.status}`);
      }

      let content = data.choices?.[0]?.message?.content || 'Нет ответа от API.';
      let citations = data.citations?.map((item, index) => `[${index + 1}] ${item}`) || [];

      if (citations.length > 0) {
        content = [content, citations.join('\n')].join('\n\n');
      }

      console.log('Ответ от API:', content);

      // content = content
      //   .replace(/<think>/gi, '')
      //   .replace(/^\s*\d+\.\s*/gm, '')
      //   .replace(/^\s*[-–•]\s*/gm, '')
      //   .replace(/^\s*[\*\u2022]\s*/gm, '')
      //   .replace(/\n{2,}/g, '\n')
      //   .trim();
      content = content.replace(/<think>.*\s*?<\/think>/gs, '').trim();

      console.log('Ответ от API:', content);

      setMessages(prev => [...prev, { sender: 'bot', text: content }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Ошибка при запросе к API: ' + error.message }]);
    }

    setLoading(false);
  };

  const renderBotMessage = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return (
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.5, color: '#222' }}>
        {lines.map((line, i) => {
          // Проверяем, является ли строка ссылкой вида "[N] http..."
          const linkMatch = line.match(/^\[(\d+)\]\s+(https?:\/\/\S+)/);
          if (linkMatch) {
            return (
              <li key={i} style={{ marginBottom: 4 }}>
                <a href={linkMatch[2]} target="_blank" rel="noopener noreferrer">Ссылка {linkMatch[1]}</a>
              </li>
            );
          }
          return (
            <li key={i} style={{ marginBottom: 4 }}>
              {line.trim()}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      {/* Кнопка открытия/закрытия чата */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          position: 'fixed',
          bottom: 18,
          right: 18,
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: '#f57838',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          fontSize: 24,
          cursor: 'pointer',
          zIndex: 1301
        }}
        aria-label={isOpen ? 'Закрыть чат' : 'Открыть чат'}
      >
        {isOpen ? '×' : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="none"/>
            <path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7l-3 3z" fill="white"/>
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            right: 18,
            bottom: 80,
            zIndex: 1300,
            width: 320,
            maxWidth: '95vw',
            height: 520,
            borderRadius: 14,
            padding: 12,
            backgroundColor: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'box-shadow 0.2s',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }}
        >
          <h2
            style={{
              margin: '0 0 10px 0',
              textAlign: 'center',
              color: '#f57838',
              fontWeight: 700,
              fontSize: 18,
              userSelect: 'none'
            }}
          >
            Ключевые новости
          </h2>

          <div
            style={{
              flexGrow: 1,
              overflowY: 'auto',
              padding: 10,
              borderRadius: 10,
              backgroundColor: '#f7f8fa',
              border: '1px solid #e2e2e2',
              boxShadow: 'inset 0 0 6px #f0f0f0',
              marginBottom: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              scrollbarWidth: 'thin',
              fontSize: 13,
              lineHeight: 1.5,
              userSelect: 'text'
            }}
          >
            {messages.map((m, i) =>
              m.sender === 'bot' ? (
                <div
                  key={i}
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#e9f1fb',
                    padding: '10px 14px',
                    borderRadius: '14px 14px 14px 4px',
                    maxWidth: '90%',
                    boxShadow: '0 2px 6px rgba(21,87,36,0.1)',
                    color: '#222',
                    whiteSpace: 'pre-wrap',
                    userSelect: 'text',
                    fontWeight: 500
                  }}
                >
                  {renderBotMessage(m.text)}
                </div>
              ) : (
                <div
                  key={i}
                  style={{
                    alignSelf: 'flex-end',
                    backgroundColor: '#dcdcdc',
                    color: '#333',
                    padding: '8px 12px',
                    borderRadius: '14px 14px 4px 14px',
                    maxWidth: '90%',
                    fontSize: 13,
                    lineHeight: 1.4,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    userSelect: 'text',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {m.text}
                </div>
              )
            )}
            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  color: '#888',
                  fontStyle: 'italic',
                  fontSize: 12,
                  padding: '6px 10px',
                  userSelect: 'none'
                }}
              >
                Ищу информацию...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Введите вопрос о компании..."
              disabled={loading}
              style={{
                flexGrow: 1,
                padding: '7px 14px',
                fontSize: 14,
                borderRadius: 16,
                border: '1.2px solid #ccc',
                outline: 'none',
                transition: 'border-color 0.25s ease',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                fontWeight: 500,
                color: '#222',
                userSelect: 'text'
              }}
              autoComplete="off"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: '6px 14px',
                fontSize: 14,
                backgroundColor: loading || !input.trim() ? '#bdbdbd' : '#f57838',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                boxShadow: loading || !input.trim()
                  ? 'none'
                  : '0 4px 8px rgba(245, 120, 56, 0.3)',
                transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                userSelect: 'none'
              }}
              aria-label="Отправить сообщение"
            >
              Отправить
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatComponent;
