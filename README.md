# Coding Agent

A simple coding agent from scratch. The agent should be able to:

1. Change existing code
2. Write new code
3. Run commands (servers, scripts, etc.)
4. Understand the codebase

The goal is to keep the agent **unopinionated** — it decides how to approach problems using the tools you give it.

---

## How does a coding agent work?

A coding agent runs in a loop, repeatedly interacting with its environment. Each iteration:

1. The agent decides what action to take - Not you. This is very important.

   You should not assume the agent goes through a specific process to do tasks.

   Instead, the agent should just have access to some tool / tools that it calls however it likes.

2. It performs that action (e.g., running a command, reading a file)

3. It receives the output of the action.

4. It uses that feedback along with previous context to decide the next action

This continues until the agent decides the task has been completed.

---

To install dependencies:

```bash
bun install
```

To run the agent test:

```bash
bun test
```

To clean up test runs:

```bash
bun run clean
```

This project was created using `bun init` in bun v1.3.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
