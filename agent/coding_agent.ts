import { OpenAI, Message } from './openai';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const SYSTEM_PROMPT = fs.readFileSync(
  path.join(import.meta.dirname, 'CodingAgentPrompt.md'),
  'utf-8'
);

export class Agent {
  private readonly openai: OpenAI;
  private workingDir: string;

  constructor(private readonly maxTurns: number = 50) {
    this.openai = new OpenAI();
  }

  parseToolCall(response: string): {
    name: string;
    params: Record<string, string>;
  } | null {
    const toolCallMatch = response.match(/<tool_call>([\s\S]*?)<\/tool_call>/);
    if (!toolCallMatch) return null;

    const toolCallContent = toolCallMatch[1];

    const nameMatch = toolCallContent.match(/<name>([\s\S]*?)<\/name>/);
    if (!nameMatch) return null;

    const name = nameMatch[1].trim();
    const params: Record<string, string> = {};

    const paramRegex = /<param name="([^"]+)">([\s\S]*?)<\/param>/g;
    let paramMatch;
    while ((paramMatch = paramRegex.exec(toolCallContent)) !== null) {
      params[paramMatch[1]] = paramMatch[2];
    }

    return { name, params };
  }

  // Tools
  // Allow the model to use run_command method as a tool
  async run_command(
    command: string
  ): Promise<{ output: string; stdout: string; error: Error | null }> {
    return new Promise((resolve) => {
      exec(command, { cwd: this.workingDir }, (error, stdout, stderr) => {
        if (error) {
          resolve({
            output: stderr || error.message,
            stdout: '',
            error: error,
          });
        } else {
          resolve({ output: stdout, stdout, error: null });
        }
      });
    });
  }

  async read_file(filePath: string): Promise<string> {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.workingDir, filePath);
      return fs.readFileSync(fullPath, 'utf-8');
    } catch (error: any) {
      return `Error reading file: ${error.message}`;
    }
  }

  async write_file(filePath: string, content: string): Promise<string> {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.workingDir, filePath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, content, 'utf-8');
      return `Successfully wrote to ${filePath}`;
    } catch (error: any) {
      return `Error writing file: ${error.message}`;
    }
  }

  async list_dir(dirPath: string): Promise<string> {
    try {
      const fullPath = path.isAbsolute(dirPath) ? dirPath : path.join(this.workingDir, dirPath);
      const entries = fs.readdirSync(fullPath, { withFileTypes: true });
      const result = entries.map((entry) => {
        const type = entry.isDirectory() ? '[DIR]' : '[FILE]';
        return `${type} ${entry.name}`;
      });
      return result.join('\n');
    } catch (error: any) {
      return `Error listing directory: ${error.message}`;
    }
  }

  async executeTool(toolCall: {
    name: string;
    params: Record<string, string>;
  }): Promise<{ result: string; finished: boolean }> {
    switch (toolCall.name) {
      case 'run_command': {
        const { output, error } = await this.run_command(toolCall.params.command);
        return {
          result: error ? `Command failed: ${output}` : output,
          finished: false,
        };
      }
      case 'read_file': {
        const content = await this.read_file(toolCall.params.path);
        return { result: content, finished: false };
      }
      case 'write_file': {
        const result = await this.write_file(toolCall.params.path, toolCall.params.content);
        return { result, finished: false };
      }
      case 'list_dir': {
        const listing = await this.list_dir(toolCall.params.path || '.');
        return { result: listing, finished: false };
      }
      case 'finish': {
        return { result: 'Task completed.', finished: true };
      }
      default:
        return { result: `Unknown tool: ${toolCall.name}`, finished: false };
    }
  }

  async run(working_dir: string, prompt: string): Promise<void> {
    this.workingDir = working_dir;

    const messages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Working directory: ${working_dir}\n\nTask: ${prompt}`,
      },
    ]


    for (let i = 0; i < this.maxTurns; i++) {
      const response = await this.openai.call(messages);

      messages.push({ role: 'assistant', content: response });

      const toolCall = this.parseToolCall(response);

      if (!toolCall) {
        if (
          response.toLowerCase().includes('task complete') ||
          response.toLowerCase().includes('finished') ||
          response.toLowerCase().includes('done')
        ) {
          break;
        }
        messages.push({
          role: 'user',
          content:
            'Please use one of the available tools to continue, or call the finish tool if the task is complete.',
        });
        continue;
      };

      const { result, finished } = await this.executeTool(toolCall);

      if (finished) break;

      messages.push(
        {
          role: 'user',
          content: `Tool result for ${toolCall.name}:\n${result}`,
        }
      )

      continue;
    }
  }
}
