import {
  ChatCompletionMessage,
  LangchainChatClient,
} from "@/infrastructure/LLM/langchain-chat-client";
import { ChatModel, LLMProvider } from "@/infrastructure/LLM/make-llm";

import {
  TextSummarizer,
  TextSummaryResult,
} from "@/application/contracts/text-summarizer";

const DEFAULT_SUMMARY_PROMPT =
  "Você é um assistente que resume entradas de uma base de conhecimento. Gere um resumo curto e objetivo em português, destacando apenas as informações essenciais.";

export class LangchainTextSummarizer implements TextSummarizer {
  private readonly prompt: string;
  private readonly chatModel = new ChatModel();
  private client: LangchainChatClient | null = null;
  private readonly provider: LLMProvider;
  private readonly apiKey: string;

  constructor(provider: LLMProvider, apiKey: string, prompt?: string) {
    const sanitizedApiKey = apiKey.trim();

    if (!sanitizedApiKey) {
      throw new Error("An API key is required to instantiate the summarizer.");
    }

    this.provider = provider;
    this.apiKey = sanitizedApiKey;
    this.prompt = prompt?.trim() || DEFAULT_SUMMARY_PROMPT;
  }

  private ensureClient(): LangchainChatClient {
    if (!this.client) {
      this.client = this.chatModel.makeLLM(
        this.provider,
        this.apiKey,
      ) as unknown as LangchainChatClient;
    }

    return this.client;
  }

  private buildMessages(text: string): ChatCompletionMessage[] {
    return [
      { role: "system", content: this.prompt },
      { role: "user", content: text },
    ];
  }

  async summarize(text: string): Promise<TextSummaryResult> {
    const trimmedText = text.trim();
    const client = this.ensureClient();

    const response = await client.client.chat.completions.create({
      model: client.model,
      messages: this.buildMessages(trimmedText),
    });

    const summary =
      response?.choices?.[0]?.message?.content?.trim() ?? trimmedText;

    return {
      summary: summary.length > 0 ? summary : trimmedText,
      model: client.model,
      provider: this.provider,
    };
  }
}
