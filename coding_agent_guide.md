# How does a coding agent work?

A coding agent runs in a loop, repeatedly interacting with its environment. Each iteration:

1. The agent decides what action to take - Not you. This is very important.

   You should not assume the agent goes through a specific process to do tasks.

   Instead, the agent should just have access to some tool / tools that it calls however it likes.

2. It performs that action (e.g., running a command, reading a file)

3. It receives the output of the action.

4. It uses that feedback along with previous context to decide the next action

This continues until the agent decides the task has been completed.
