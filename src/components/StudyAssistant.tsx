'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useUiStore } from '@/store/useUiStore';
import { useUserData } from '@/hooks/useUserData';
import { PATHS } from '@/config/roadmapData';
import confetti from 'canvas-confetti';

export default function StudyAssistant() {
  const { activeNodeId, isAssistantOpen, setAssistantOpen, chatMessages, addChatMessage, activeQuiz, setActiveQuiz } = useUiStore();
  const { activePath, completedNodes, completeNode, toggleQuest } = useUserData();
  
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const pathInfo = PATHS[activePath] || PATHS['data-engineering'];
  const currentNode = pathInfo.nodes.find((n) => n.id === activeNodeId);
  const isCompleted = activeNodeId ? completedNodes.includes(activeNodeId) : false;

  const currentMessages = useMemo(() => {
    return activeNodeId ? chatMessages[activeNodeId] || [] : [];
  }, [activeNodeId, chatMessages]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, activeQuiz]);

  // Generate welcome message when active node changes
  useEffect(() => {
    if (!activeNodeId || !currentNode) return;
    
    // Only add welcome message if chat history is empty for this node
    const history = chatMessages[activeNodeId] || [];
    if (history.length === 0) {
      addChatMessage(activeNodeId, {
        sender: 'assistant',
        text: `Welcome to **${currentNode.title}**! I'm your AI Study Assistant. I can help you master these skills: *${currentNode.skills.join(', ')}*.\n\nWould you like a quick quiz to test your knowledge, or should we review the study resources?`,
      });
    }
  }, [activeNodeId, currentNode, addChatMessage, chatMessages]);

  const handleMarkComplete = async () => {
    if (!activeNodeId) return;
    
    await completeNode({ nodeId: activeNodeId, xpReward: 100 });
    
    // Trigger confetti!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    // Trigger quest completion if needed
    toggleQuest({ questId: 'q1', completed: true });

    if (activeNodeId) {
      addChatMessage(activeNodeId, {
        sender: 'assistant',
        text: `🎉 **Congratulations!** You have marked **${currentNode?.title}** as complete and earned **+100 XP**! The next nodes in your roadmap are now unlocked.`,
      });
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeNodeId || !currentNode) return;

    // 1. Add user message
    addChatMessage(activeNodeId, {
      sender: 'user',
      text: text,
    });

    if (!textToSend) {
      setInputText('');
    }

    // 2. Simulate AI response
    setTimeout(() => {
      generateAiResponse(text);
    }, 800);
  };

  // Simulated AI response generator
  const generateAiResponse = (userText: string) => {
    if (!activeNodeId || !currentNode) return;
    
    const query = userText.toLowerCase();

    // Trigger quiz
    if (query.includes('quiz') || query.includes('test')) {
      triggerQuiz();
      return;
    }

    // Trigger summary
    if (query.includes('summary') || query.includes('explain') || query.includes('what is')) {
      addChatMessage(activeNodeId, {
        sender: 'assistant',
        text: `Here is a summary of **${currentNode.title}**:\n\n${currentNode.description}\n\n**Key concepts to study:**\n${currentNode.skills.map(s => `- **${s}**`).join('\n')}\n\nCheck out the links in the **Resources** section above to dive deeper!`,
      });
      return;
    }

    // Default response
    addChatMessage(activeNodeId, {
      sender: 'assistant',
      text: `That's a great question about **${currentNode.title}**! To master this topic, you should focus on **${currentNode.skills[0]}** and **${currentNode.skills[1] || 'related practices'}**. Let me know if you want me to quiz you on this, or if you'd like a code example!`,
    });
  };

  const triggerQuiz = () => {
    if (!activeNodeId || !currentNode || currentNode.quizzes.length === 0) return;
    
    const quizData = currentNode.quizzes[0]; // Get the first quiz
    
    setActiveQuiz({
      question: quizData.question,
      options: quizData.options,
      correctIndex: quizData.correctIndex,
      explanation: quizData.explanation,
      answeredIndex: null,
    });

    addChatMessage(activeNodeId, {
      sender: 'assistant',
      text: `Let's test your knowledge! Here is a quiz question about **${currentNode.title}**:`,
    });
  };

  const handleAnswerQuiz = async (optionIndex: number) => {
    if (!activeQuiz || !activeNodeId) return;
    
    const isCorrect = optionIndex === activeQuiz.correctIndex;
    
    setActiveQuiz({
      ...activeQuiz,
      answeredIndex: optionIndex,
    });

    // Add quiz response message
    addChatMessage(activeNodeId, {
      sender: 'assistant',
      text: isCorrect 
        ? `✅ **Correct!** Great job. You've earned **+50 XP**!\n\n*Explanation: ${activeQuiz.explanation}*`
        : `❌ **Incorrect.** You selected "${activeQuiz.options[optionIndex]}". The correct answer is **"${activeQuiz.options[activeQuiz.correctIndex]}"**.\n\n*Explanation: ${activeQuiz.explanation}*`,
    });

    if (isCorrect) {
      // Award XP for correct quiz answer
      await completeNode({ nodeId: '_quiz_bonus', xpReward: 50 });
      // Complete daily quest if applicable
      toggleQuest({ questId: 'q2', completed: true });
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 }
      });
    }
  };

  // If no node is focused
  if (!activeNodeId || !currentNode) {
    return (
      <aside className={`fixed lg:relative top-0 right-0 h-full w-80 lg:w-96 shrink-0 border-l border-outline-variant bg-surface/60 backdrop-blur-xl flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-30 transition-transform duration-300 lg:translate-x-0 dark:bg-background/60 dark:border-outline/30 ${
        isAssistantOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface/80 dark:bg-background/80 dark:border-outline/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed">smart_toy</span>
            <h2 className="font-headline-md text-[18px] font-semibold text-on-surface dark:text-on-surface">Study Assistant</h2>
          </div>
          <button 
            onClick={() => setAssistantOpen(false)}
            className="lg:hidden text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-on-surface-variant dark:text-outline-variant">
          <span className="material-symbols-outlined text-5xl mb-4 text-outline/50 animate-pulse">
            ads_click
          </span>
          <h3 className="font-headline-md text-base font-medium mb-1">No Node Selected</h3>
          <p className="font-body-sm text-xs max-w-[240px]">
            Click on any unlocked node in your learning path to view resources and start studying.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`fixed lg:relative top-0 right-0 h-full w-80 lg:w-96 shrink-0 border-l border-outline-variant bg-surface/60 backdrop-blur-xl flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-30 transition-transform duration-300 lg:translate-x-0 dark:bg-background/60 dark:border-outline/30 ${
      isAssistantOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface/80 dark:bg-background/80 dark:border-outline/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary dark:text-primary-fixed">smart_toy</span>
          <h2 className="font-headline-md text-[17px] font-semibold text-on-surface dark:text-on-surface">
            Study Assistant
          </h2>
        </div>
        <button 
          onClick={() => setAssistantOpen(false)}
          className="lg:hidden text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Lesson Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {/* Node Overview */}
        <div className="bg-surface border border-outline-variant rounded-xl p-4 shadow-sm dark:bg-inverse-surface/10 dark:border-outline/20">
          <h3 className="font-headline-md text-base font-bold text-on-surface dark:text-on-surface mb-1">
            {currentNode.title}
          </h3>
          <p className="font-body-sm text-xs text-on-surface-variant dark:text-outline-variant mb-3">
            {currentNode.subtitle}
          </p>
          <p className="font-body-sm text-[13px] text-on-surface/90 dark:text-on-surface/85 mb-4">
            {currentNode.description}
          </p>

          {/* Skills tags */}
          <div className="mb-4">
            <h4 className="font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">Skills You Will Learn</h4>
            <div className="flex flex-wrap gap-1.5">
              {currentNode.skills.map((skill) => (
                <span 
                  key={skill}
                  className="font-code text-[10px] bg-primary/5 text-primary border border-primary/10 rounded px-2 py-0.5 dark:bg-primary/20 dark:text-primary-fixed"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Study Resources */}
          <div className="mb-4">
            <h4 className="font-label-md text-[11px] text-outline uppercase tracking-wider mb-2">Learning Resources</h4>
            <div className="space-y-2">
              {currentNode.resources.map((res, idx) => (
                <a 
                  key={idx}
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:underline font-body-md dark:text-primary-fixed"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {res.type === 'video' ? 'play_circle' : res.type === 'doc' ? 'menu_book' : 'article'}
                  </span>
                  <span className="truncate">{res.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Action Button */}
          {isCompleted ? (
            <div className="w-full bg-secondary/10 border border-secondary/20 text-secondary font-label-md text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 dark:bg-secondary/20 dark:text-secondary-fixed-dim">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Completed
            </div>
          ) : (
            <button
              onClick={handleMarkComplete}
              className="w-full bg-primary text-on-primary font-label-md text-xs py-2 px-3 rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-1 shadow-sm dark:bg-primary-container dark:text-on-primary-container dark:hover:bg-primary-container/80"
            >
              Mark as Complete
              <span className="material-symbols-outlined text-[16px]">done</span>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-outline-variant dark:border-outline/20"></div>
          <span className="flex-shrink mx-3 text-[10px] text-outline uppercase tracking-widest font-code">AI Chat</span>
          <div className="flex-grow border-t border-outline-variant dark:border-outline/20"></div>
        </div>

        {/* Chat Thread */}
        <div className="space-y-3">
          {currentMessages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs border ${
                msg.sender === 'assistant' 
                  ? 'bg-primary-container text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-fixed'
                  : 'bg-surface-container-high border-outline-variant overflow-hidden'
              }`}>
                {msg.sender === 'assistant' ? (
                  <span className="material-symbols-outlined text-sm icon-fill">smart_toy</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">person</span>
                )}
              </div>
              
              {/* Message bubble */}
              <div className={`rounded-xl px-3 py-2 text-xs shadow-sm max-w-[80%] ${
                msg.sender === 'user'
                  ? 'bg-primary text-on-primary rounded-tr-none dark:bg-primary-container dark:text-on-primary-container'
                  : 'bg-surface border border-outline-variant text-on-surface rounded-tl-none dark:bg-inverse-surface/20 dark:border-outline/20'
              }`}>
                <p className="leading-relaxed whitespace-pre-line font-body-sm">
                  {msg.text}
                </p>
                {msg.code && (
                  <div className="bg-inverse-surface text-inverse-on-surface p-2 rounded-lg mt-2 font-code text-[11px] overflow-x-auto">
                    <pre><code>{msg.code}</code></pre>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Interactive Quiz Display */}
          {activeQuiz && (
            <div className="bg-surface border-2 border-primary/30 rounded-xl p-4 shadow-md space-y-3 dark:bg-inverse-surface/10 dark:border-primary-fixed/30">
              <div className="flex items-center gap-1 text-primary font-label-md text-xs dark:text-primary-fixed">
                <span className="material-symbols-outlined text-[16px]">quiz</span>
                Question:
              </div>
              <p className="font-body-sm text-[13px] text-on-surface font-semibold dark:text-on-surface">
                {activeQuiz.question}
              </p>
              <div className="space-y-2 pt-1">
                {activeQuiz.options.map((option, idx) => {
                  const isAnswered = activeQuiz.answeredIndex !== null;
                  const isSelected = activeQuiz.answeredIndex === idx;
                  const isCorrect = idx === activeQuiz.correctIndex;

                  let btnStyle = 'border-outline-variant hover:bg-surface-container dark:border-outline/30';
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-secondary/10 border-secondary text-secondary dark:bg-secondary/20 dark:text-secondary-fixed-dim';
                    } else if (isSelected) {
                      btnStyle = 'bg-error/10 border-error text-error dark:bg-error/20 dark:text-error-container';
                    } else {
                      btnStyle = 'opacity-50 border-outline-variant dark:border-outline/20';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleAnswerQuiz(idx)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswered && isCorrect && (
                        <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <span className="material-symbols-outlined text-error text-[16px]">cancel</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        {!activeQuiz && (
          <div className="pl-9 flex flex-wrap gap-1.5 pt-2">
            <button 
              onClick={() => handleSendMessage('Quiz me on this topic!')}
              className="font-label-md text-[11px] text-primary border border-primary/30 rounded-full px-2.5 py-1 hover:bg-primary/5 transition-colors dark:text-primary-fixed dark:border-primary-fixed/30"
            >
              Quiz me
            </button>
            <button 
              onClick={() => handleSendMessage('Give me a summary of this topic')}
              className="font-label-md text-[11px] text-primary border border-primary/30 rounded-full px-2.5 py-1 hover:bg-primary/5 transition-colors dark:text-primary-fixed dark:border-primary-fixed/30"
            >
              Summarize
            </button>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-surface border-t border-outline-variant dark:bg-background dark:border-outline/30">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="relative"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask about ${currentNode.title}...`}
            className="w-full bg-surface-container rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary py-2.5 pl-4 pr-10 text-xs font-body-sm placeholder:text-outline transition-all outline-none dark:bg-inverse-surface/30 dark:border-outline/30 dark:text-on-surface"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-primary text-on-primary rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors dark:bg-primary-container dark:text-on-primary-container"
          >
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
