import {
  ChatCompletionMessage,
  QuestionLanguageModel
} from '@/application/contracts/question-language-model'
import { ApplicationError } from '@/application/errors/application-error'
import { ChatRepository } from '@/domain/repositories/chat-repository'
import { MessageRepository } from '@/domain/repositories/message-repository'

type SubmitQuestionInput = {
  question: string
  chatId: number
  userId: number
}

type SubmitQuestionOutput = {
  answer: string
}

export class SubmitQuestionUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
    private readonly languageModel: QuestionLanguageModel
  ) {}

  async execute(input: SubmitQuestionInput): Promise<SubmitQuestionOutput> {
    const chat = await this.chatRepository.findById(input.chatId)

    if (!chat || chat.userId !== input.userId) {
      throw new ApplicationError('Chat not found', 404)
    }

    const history = await this.messageRepository.findByChatId(chat.id)

    const context: ChatCompletionMessage[] = history.map(message => ({
      role: message.sender === 'USER' ? 'user' : 'assistant',
      content: message.text
    }))

    await this.messageRepository.create({
      chatId: chat.id,
      text: input.question,
      sender: 'USER'
    })

    const answer = await this.languageModel.generate(input.question, '', context)

    await this.messageRepository.create({
      chatId: chat.id,
      text: answer,
      sender: 'AI'
    })

    return { answer }
  }
}
