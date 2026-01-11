import { OpenAI } from '../agent/openai';

const openai = new OpenAI();

const response = await openai.call([
  {
    role: 'user',
    content: 'What is the capital of France?',
  },
]);

console.log(response);
