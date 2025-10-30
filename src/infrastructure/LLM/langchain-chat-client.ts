export type ChatCompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export type LangchainChatClient = {
  model: string;
  client: {
    chat: {
      completions: {
        create: (input: {
          model: string;
          messages: ChatCompletionMessage[];
        }) => Promise<ChatCompletionResponse>;
      };
    };
  };
};
