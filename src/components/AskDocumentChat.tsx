import React, { useState, useRef, useEffect, FormEvent } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  BookOpen,
  FileText,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  CornerDownLeft,
  Loader2
} from 'lucide-react';
import { AnalysisResult, ChatMessage } from '../types/document';
import { answerDocumentQuestion } from '../services/gemini';
import { useDocumentContext } from '../services/documentContext';

interface AskDocumentChatProps {
  document: AnalysisResult;
  initialQuestion?: string | null;
}

export const AskDocumentChat: React.FC<AskDocumentChatProps> = ({
  document,
  initialQuestion
}) => {
  const { chatHistory, addChatMessage } = useDocumentContext();
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompt chips based on document type
  const defaultQuestions = [
    'Can my landlord increase rent?',
    'What happens if I terminate early?',
    'When does this agreement renew?',
    'Who is responsible for repairs?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isAsking]);

  useEffect(() => {
    if (initialQuestion) {
      handleAskQuestion(initialQuestion);
    }
  }, [initialQuestion]);

  const handleAskQuestion = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isAsking) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    addChatMessage(userMsg);
    setInputQuestion('');
    setIsAsking(true);

    try {
      const response = await answerDocumentQuestion({
        rawText: document.metadata.rawText || document.summary,
        question: trimmed,
        documentType: document.documentType,
        clauses: document.clauses,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clauseReference: response.clauseReference,
        pageReference: response.pageReference,
        evidenceSnippet: response.evidenceSnippet,
        evidenceStrength: response.evidenceStrength,
        isNotFound: response.isNotFound,
      };

      addChatMessage(aiMsg);
    } catch (err: any) {
      addChatMessage({
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an issue retrieving that answer from the document context. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNotFound: true,
      });
    } finally {
      setIsAsking(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleAskQuestion(inputQuestion);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[700px] max-h-[85vh]">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Ask Your Document
            </h3>
            <p className="text-[11px] text-slate-500">
              Grounded exclusively in <span className="font-semibold text-slate-700">{document.metadata.fileName}</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero Hallucination Protocol</span>
        </div>
      </div>

      {/* Suggested Starter Questions Chips */}
      <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
          Suggested:
        </span>
        {defaultQuestions.map(q => (
          <button
            key={q}
            onClick={() => handleAskQuestion(q)}
            disabled={isAsking}
            className="text-xs px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {chatHistory.map(msg => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${isUser ? 'items-end text-right' : ''}`}>
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed text-left ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : msg.isNotFound
                      ? 'bg-amber-50 text-amber-950 border border-amber-200'
                      : 'bg-slate-50 text-slate-900 border border-slate-200/80 shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Zero Hallucination Badge when information is absent */}
                  {!isUser && msg.isNotFound && (
                    <div className="mt-2.5 pt-2.5 border-t border-amber-200/80 flex items-center space-x-1.5 text-[11px] font-semibold text-amber-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Zero Hallucination Protocol: Information absent from uploaded contract text</span>
                    </div>
                  )}

                  {/* Grounded Evidence Citation Block */}
                  {!isUser && !msg.isNotFound && (msg.clauseReference || msg.evidenceSnippet) && (
                    <div className="mt-3 pt-3 border-t border-slate-200/70 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        {msg.clauseReference && (
                          <span className="font-mono font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 flex items-center space-x-1">
                            <BookOpen className="w-3 h-3 inline" />
                            <span>{msg.clauseReference}</span>
                          </span>
                        )}
                        {msg.pageReference && (
                          <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {msg.pageReference}
                          </span>
                        )}
                        {msg.evidenceStrength && (
                          <span
                            className={`font-semibold px-2 py-0.5 rounded-full border ${
                              msg.evidenceStrength.includes('Strong')
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {msg.evidenceStrength}
                          </span>
                        )}
                      </div>

                      {msg.evidenceSnippet && (
                        <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/60 font-serif italic text-xs text-slate-700 leading-relaxed">
                          "{msg.evidenceSnippet}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 block px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isAsking && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>Checking document clauses and citing exact evidence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputQuestion}
            onChange={e => setInputQuestion(e.target.value)}
            placeholder="Ask anything about your contract (e.g., penalties, notice periods, repair obligations)..."
            disabled={isAsking}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isAsking}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center space-x-1.5 shadow-sm"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[11px] text-slate-600 mt-2 text-center">
          LexiClear answers using strictly cited clauses. It will state if information is not found in the document.
        </p>
      </form>
    </div>
  );
};
