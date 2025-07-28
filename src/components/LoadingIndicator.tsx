export const LoadingIndicator = () => {
  return (
    <div className="flex justify-start w-full mb-4">
      <div className="bg-chat-ai text-chat-ai-foreground max-w-[80%] rounded-2xl px-4 py-3 shadow-sm mr-12">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-muted-foreground">HagopAI is thinking...</span>
        </div>
      </div>
    </div>
  );
};