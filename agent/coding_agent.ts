import { OpenAI } from './openai';
import { exec } from 'child_process';

export class Agent {
  private readonly openai: OpenAI;

  constructor(private readonly maxTurns: number = 50) {
    this.openai = new OpenAI();
  }

  // Allow the model to use run_command method as a tool
  async run_command(
    command: string
  ): Promise<{ output: string; stdout: string; error: Error | null }> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          return {
            output: '',
            stdout: '',
            error: error,
          };
        } else {
          resolve({ output: stdout, stdout, error: null });
        }
      });
    });
  }

  async run(working_dir: string, prompt: string): Promise<void> {
    // Write the code here
    for (let i = 0; i < this.maxTurns; i++) {
      continue;
    }
  }
}
