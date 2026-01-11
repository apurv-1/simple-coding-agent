# Task: Build a Command-Line TODO Application

Create a command-line TODO application in TypeScript that allows users to manage their tasks.

## Requirements

1. **File Structure**: Create the following files:

   - `todo.ts` - Main application file
   - `storage.ts` - Handles reading/writing tasks to a JSON file
   - `types.ts` - Type definitions
   - `package.json` - Project dependencies (should include @types/node)

2. **Functionality**: The application should support these commands:

   - `add <task>` - Add a new task
   - `list` - List all tasks with their IDs and completion status
   - `complete <id>` - Mark a task as completed
   - `delete <id>` - Delete a task by ID
   - `help` - Show usage instructions

3. **Task Structure**: Each task should have:

   - `id` (number) - Unique identifier
   - `description` (string) - Task description
   - `completed` (boolean) - Completion status
   - `createdAt` (string) - ISO timestamp

4. **Data Persistence**:

   - Store tasks in a `tasks.json` file
   - If the file doesn't exist, create it with an empty array
   - Auto-increment IDs starting from 1

5. **Example Usage**:

   ```bash
   ts-node todo.ts add "Buy groceries"
   # Output: Added task #1: Buy groceries

   ts-node todo.ts list
   # Output:
   # 1. [ ] Buy groceries (Created: 2025-10-06T10:00:00.000Z)

   ts-node todo.ts complete 1
   # Output: Completed task #1

   ts-node todo.ts list
   # Output:
   # 1. [✓] Buy groceries (Created: 2025-10-06T10:00:00.000Z)
   ```

6. **Error Handling**:
   - Handle invalid commands gracefully
   - Handle non-existent task IDs
   - Handle file system errors

## Success Criteria

The application should be fully functional and pass these test scenarios:

1. Adding multiple tasks works correctly
2. Listing shows all tasks with proper formatting
3. Completing and deleting tasks works by ID
4. Data persists across multiple runs
5. Error messages are clear and helpful
6. Put the code in the top working director. Do not put it in a subfolder or something like that
