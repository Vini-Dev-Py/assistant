import { QuestionLanguageModel } from "@/application/contracts/question-language-model";
import {
  ChatCompletionMessage,
  LangchainChatClient,
} from "@/infrastructure/LLM/langchain-chat-client";
import { ChatModel, LLMProvider } from "@/infrastructure/LLM/make-llm";

export class LangchainQuestionLanguageModel implements QuestionLanguageModel {
  private readonly llmInstance: LangchainChatClient;

  constructor(provider: LLMProvider, apiKey: string) {
    const chatModel = new ChatModel();
    this.llmInstance = chatModel.makeLLM(provider, apiKey) as LangchainChatClient;
  }

  async generate(question: string, prompt: string): Promise<string> {
    const response = await this.llmInstance.client.chat.completions.create({
      model: this.llmInstance.model,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: question },
      ],
    });

    return response?.choices?.[0]?.message?.content ?? "";
  }
}
