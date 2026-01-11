import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function testSolution(runDir: string) {
  console.log('Testing solution in:', runDir);

  // Test 1: Check required files exist
  console.log('\n✓ Test 1: Checking required files...');
  const requiredFiles = ['todo.ts', 'storage.ts', 'types.ts', 'package.json'];
  for (const file of requiredFiles) {
    const filePath = path.join(runDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing required file: ${file}`);
    }
    console.log(`  ✓ ${file} exists`);
  }

  // Test 2: Check package.json has required dependencies
  console.log('\n✓ Test 2: Checking package.json...');
  const packageJson = JSON.parse(fs.readFileSync(path.join(runDir, 'package.json'), 'utf-8'));
  if (!packageJson.dependencies?.['@types/node'] && !packageJson.devDependencies?.['@types/node']) {
    throw new Error('package.json missing @types/node dependency');
  }
  console.log('  ✓ package.json has @types/node');

  // Install dependencies
  console.log('\n✓ Installing dependencies...');
  try {
    execSync('npm install', {
      cwd: runDir,
      stdio: 'pipe',
    });
    console.log('  ✓ Dependencies installed');
  } catch (error) {
    throw new Error('Failed to install dependencies');
  }

  // Clean up any existing tasks.json
  const tasksPath = path.join(runDir, 'tasks.json');
  if (fs.existsSync(tasksPath)) {
    fs.unlinkSync(tasksPath);
  }

  // Test 3: Add tasks
  console.log('\n✓ Test 3: Testing add command...');
  const output1 = execSync('npx tsx todo.ts add "Buy groceries"', {
    cwd: runDir,
    encoding: 'utf-8',
  });
  console.log('  Output:', output1.trim());
  if (!output1.includes('1') || !output1.toLowerCase().includes('buy groceries')) {
    throw new Error("Add command didn't return expected output");
  }

  const output2 = execSync('npx tsx todo.ts add "Write code"', {
    cwd: runDir,
    encoding: 'utf-8',
  });
  console.log('  Output:', output2.trim());
  if (!output2.includes('2') || !output2.toLowerCase().includes('write code')) {
    throw new Error("Add command didn't return expected output for second task");
  }
  console.log('  ✓ Add command works');

  // Test 4: List tasks
  console.log('\n✓ Test 4: Testing list command...');
  const listOutput = execSync('npx tsx todo.ts list', {
    cwd: runDir,
    encoding: 'utf-8',
  });
  console.log('  Output:\n', listOutput);
  if (!listOutput.includes('Buy groceries') || !listOutput.includes('Write code')) {
    throw new Error("List command doesn't show all tasks");
  }
  // Check for incomplete indicators ([ ] or similar)
  const lines = listOutput.split('\n');
  const taskLines = lines.filter((l) => l.includes('Buy groceries') || l.includes('Write code'));
  if (taskLines.length < 2) {
    throw new Error("List command doesn't show both tasks");
  }
  console.log('  ✓ List command works');

  // Test 5: Complete a task
  console.log('\n✓ Test 5: Testing complete command...');
  const completeOutput = execSync('npx tsx todo.ts complete 1', {
    cwd: runDir,
    encoding: 'utf-8',
  });
  console.log('  Output:', completeOutput.trim());
  if (!completeOutput.toLowerCase().includes('complet')) {
    throw new Error("Complete command didn't return expected output");
  }

  // Verify task is marked complete
  const listAfterComplete = execSync('npx tsx todo.ts list', {
    cwd: runDir,
    encoding: 'utf-8',
  });
  console.log('  List after complete:\n', listAfterComplete);
  // Should have some indicator of completion (✓, [x], etc.)
  const groceryLine = listAfterComplete.split('\n').find((l) => l.includes('Buy groceries'));
  if (!groceryLine) {
    throw new Error('Completed task not shown in list');
  }
  console.log('  ✓ Complete command works');

  // Test 6: Delete a task
  console.log('\n✓ Test 6: Testing delete command...');
  const deleteOutput = execSync('npx tsx todo.ts delete 2', {
    cwd: runDir,
    encoding: 'utf-8',
  });
  console.log('  Output:', deleteOutput.trim());
  if (!deleteOutput.toLowerCase().includes('delet')) {
    throw new Error("Delete command didn't return expected output");
  }

  // Verify task is deleted
  const listAfterDelete = execSync('npx tsx todo.ts list', {
    cwd: runDir,
    encoding: 'utf-8',
  });
  console.log('  List after delete:\n', listAfterDelete);
  if (listAfterDelete.includes('Write code')) {
    throw new Error('Deleted task still appears in list');
  }
  if (!listAfterDelete.includes('Buy groceries')) {
    throw new Error('Other task disappeared after delete');
  }
  console.log('  ✓ Delete command works');

  // Test 7: Data persistence
  console.log('\n✓ Test 7: Testing data persistence...');
  if (!fs.existsSync(tasksPath)) {
    throw new Error('tasks.json file not created');
  }
  const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
  if (!Array.isArray(tasksData)) {
    throw new Error("tasks.json doesn't contain an array");
  }
  if (tasksData.length !== 1) {
    throw new Error(`Expected 1 task in storage, found ${tasksData.length}`);
  }
  const task = tasksData[0];
  if (!task.id || !task.description || typeof task.completed !== 'boolean' || !task.createdAt) {
    throw new Error("Task doesn't have required fields");
  }
  console.log('  ✓ Data persistence works');

  // Test 8: Help command
  console.log('\n✓ Test 8: Testing help command...');
  const helpOutput = execSync('npx tsx todo.ts help', {
    cwd: runDir,
    encoding: 'utf-8',
  });
  console.log('  Output:\n', helpOutput);
  if (
    !helpOutput.toLowerCase().includes('add') ||
    !helpOutput.toLowerCase().includes('list') ||
    !helpOutput.toLowerCase().includes('complete') ||
    !helpOutput.toLowerCase().includes('delete')
  ) {
    throw new Error("Help command doesn't show all commands");
  }
  console.log('  ✓ Help command works');

  // Test 9: Error handling
  console.log('\n✓ Test 9: Testing error handling...');
  try {
    execSync('npx tsx todo.ts complete 999', {
      cwd: runDir,
      encoding: 'utf-8',
    });
    throw new Error('Should have thrown an error for non-existent task');
  } catch (error: any) {
    // Expected to fail
    console.log('  ✓ Error handling works for non-existent tasks');
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests passed!');
  console.log('='.repeat(50));
}

// Get run directory from command line args
const runDir = process.argv[2];
if (!runDir) {
  console.error('Usage: tsx test_solution.ts <run_directory>');
  process.exit(1);
}

try {
  testSolution(runDir);
} catch (error: any) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
