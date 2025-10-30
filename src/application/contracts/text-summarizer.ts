import { LLMProvider } from "@/infrastructure/LLM/make-llm";

export interface TextSummaryResult {
  summary: string;
  model: string;
  provider: LLMProvider;
}

export interface TextSummarizer {
  summarize(text: string): Promise<TextSummaryResult>;
}
