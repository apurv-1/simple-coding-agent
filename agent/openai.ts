import { OpenAI as OpenAIClient } from 'openai';

const API_KEY = '';

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export class OpenAI {
  private readonly client: OpenAIClient;

  constructor() {
    this.client = new OpenAIClient({
      apiKey: API_KEY,
    });
  }

  async call(messages: Message[]): Promise<string> {
    console.log('Callng OpenAI with messages', messages);
    const response = await this.client.chat.completions.create({
      model: 'gpt-5',
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });
    const responseContent = response.choices[0]?.message.content ?? '';
    console.log('Response content', responseContent);
    return responseContent;
  }
}
