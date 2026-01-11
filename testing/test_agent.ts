import { Agent } from '../agent/coding_agent';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

async function testAgent() {
  const sampleDir = path.join(process.cwd(), 'testing', 'sample');
  const samplePromptPath = path.join(sampleDir, 'sample.md');

  if (!fs.existsSync(samplePromptPath)) {
    console.error('Error: testing/sample/sample.md not found');
    process.exit(1);
  }

  const task = fs.readFileSync(samplePromptPath, 'utf-8');

  // Create runs directory if it doesn't exist
  const runsDir = path.join(process.cwd(), 'testing', 'runs');
  if (!fs.existsSync(runsDir)) {
    fs.mkdirSync(runsDir, { recursive: true });
  }

  // Find the next run attempt number
  let attemptNum = 1;
  while (fs.existsSync(path.join(runsDir, `run_attempt_${attemptNum}`))) {
    attemptNum++;
  }

  // Create the run directory
  const runDir = path.join(runsDir, `run_attempt_${attemptNum}`);
  fs.mkdirSync(runDir, { recursive: true });

  console.log('=== Starting Agent Test ===');
  console.log('Attempt:', attemptNum);
  console.log('Working Directory:', runDir);
  console.log('\nTask:');
  console.log(task);
  console.log('\n' + '='.repeat(50) + '\n');

  // Create and run the agent
  const agent = new Agent();

  try {
    await agent.run(runDir, task);
    console.log('\n' + '='.repeat(50));
    console.log('=== Agent Finished ===');
    console.log('='.repeat(50));

    // Run the test solution
    const testSolutionPath = path.join(sampleDir, 'test_solution.ts');
    if (fs.existsSync(testSolutionPath)) {
      console.log('\n' + '='.repeat(50));
      console.log('=== Running Tests ===');
      console.log('='.repeat(50) + '\n');

      try {
        const testOutput = execSync(`npx tsx "${testSolutionPath}" "${runDir}"`, {
          cwd: process.cwd(),
          encoding: 'utf-8',
          stdio: 'inherit',
        });
        console.log('\n' + '='.repeat(50));
        console.log('✅ Tests passed!');
        console.log('='.repeat(50));
      } catch (error: any) {
        console.log('\n' + '='.repeat(50));
        console.log('❌ Tests failed!');
        console.log('='.repeat(50));
        process.exit(1);
      }
    } else {
      console.log('\nNote: No test_solution.ts found, skipping validation');
    }
  } catch (error: any) {
    console.error('Agent error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAgent().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
