import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Send } from 'lucide-react';
import { addMessage, setLoading, setError } from '../store/chatSlice';
import toast from 'react-hot-toast';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    const loadPromptAndKnowledge = async () => {
      try {
        const [promptResponse, knowledgeResponse] = await Promise.all([
          fetch('/system/systemPrompt.txt'),
          fetch('/knowledge/sample.txt')
        ]);
        
        const promptText = await promptResponse.text();
        const knowledgeText = await knowledgeResponse.text();
        
        setSystemPrompt(promptText);
        setKnowledgeBase(knowledgeText);
      } catch (error) {
        console.error('Failed to load prompt or knowledge base:', error);
      }
    };

    loadPromptAndKnowledge();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user' as const,
      timestamp: Date.now(),
    };

    dispatch(addMessage(userMessage));
    dispatch(setLoading(true));
    setInput('');

    try {
      // First attempt: Use knowledge base
      const knowledgePrompt = `${systemPrompt}

Knowledge Base:
${knowledgeBase}

User Question: ${input}

Instructions:
1. First, check if the knowledge base contains relevant information for the question.
2. If the knowledge base has relevant information, use it in your response and clearly indicate this.
3. If the knowledge base doesn't have relevant information, respond with: "NO_KNOWLEDGE_BASE_MATCH"
4. Follow the system prompt guidelines for formatting and tone.`;

      let response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: knowledgePrompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to get response');

      let data = await response.json();
      let answer = data.candidates[0].content.parts[0].text;

      // If no knowledge base match, use general knowledge with web search context
      if (answer.includes('NO_KNOWLEDGE_BASE_MATCH')) {
        const webSearchPrompt = `${systemPrompt}

User Question: ${input}

Instructions:
1. Use your general knowledge to provide an accurate and helpful response
2. If you're not completely certain about something, acknowledge this
3. Follow the system prompt guidelines for formatting and tone
4. Maintain your identity as Greybot developed by Greynext`;

        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: webSearchPrompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
              },
            }),
          }
        );

        if (!response.ok) throw new Error('Failed to get response');

        data = await response.json();
        answer = data.candidates[0].content.parts[0].text;
      }

      const aiMessage = {
        id: Date.now().toString(),
        text: answer,
        sender: 'ai' as const,
        timestamp: Date.now(),
      };

      dispatch(addMessage(aiMessage));
    } catch (error) {
      toast.error('Failed to get response from AI');
      dispatch(setError('Failed to get response from AI'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t bg-white p-4 sticky bottom-0"
    >
      <div className="flex space-x-4 max-w-4xl mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="chat-gradient text-white rounded-lg px-6 py-2 hover:opacity-90 transition-opacity"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}