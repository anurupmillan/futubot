import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import ReactMarkdown from 'react-markdown';
import Skeleton from 'react-loading-skeleton';

export default function ChatWindow() {
  const { messages, isLoading } = useSelector((state: RootState) => state.chat);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={message.sender === 'ai' ? 'message-ai' : 'message-user'}
        >
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      ))}
      {isLoading && (
        <div className="message-ai">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </div>
  );
}