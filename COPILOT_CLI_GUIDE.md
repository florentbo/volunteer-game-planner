# GitHub Copilot CLI Guide

## Overview

GitHub Copilot CLI is a terminal-based AI assistant that helps with command generation, code explanation, and development workflows. This guide covers the LLM models used, configuration options, and best practices for switching from planning to coding.

## LLM Models & Architecture

### Current Models (2024)

- **Primary Backend**: OpenAI GPT-4 family models
- **Specialized Training**: Fine-tuned versions optimized for:
  - Shell command generation
  - Code understanding and explanation
  - Development workflow assistance
- **Model Updates**: Automatically managed by GitHub (no user intervention required)

### Model Variants by Function

```bash
gh copilot suggest    # Command generation model (optimized for shell commands)
gh copilot explain    # Code explanation model (optimized for understanding)
```

### Model Limitations

- **No Model Selection**: Users cannot choose between different models
- **Fixed Backend**: Only GitHub's managed GPT-4 variants available
- **No Local Models**: All processing happens on GitHub's servers
- **Limited Configuration**: Minimal user control over model behavior

## Installation & Setup

### Install the Extension

```bash
# Search for available extensions
gh extension search copilot

# Install official GitHub Copilot CLI
gh extension install github/gh-copilot

# Verify installation
gh copilot --help
```

### Authentication

```bash
# Check authentication status
gh auth status

# Login if needed
gh auth login

# Configure Copilot settings
gh copilot config
```

## Usage Patterns: Plan → Code Workflow

### 1. Planning Phase

Use these commands when exploring ideas and understanding requirements:

```bash
# Get high-level suggestions
gh copilot suggest "improve React app performance"

# Understand existing code patterns
gh copilot explain "React hooks with TypeScript patterns"

# Explore implementation approaches
gh copilot suggest "add real-time updates to web application"
```

### 2. Transition to Implementation

Move from planning to specific implementation:

```bash
# Get specific implementation guidance
gh copilot suggest "create TypeScript interface for user data"

# Generate shell commands for setup
gh copilot suggest --type shell "setup React development environment"

# Get git workflow suggestions
gh copilot suggest --type git "create feature branch for new component"
```

### 3. Active Coding Phase

During development, use these patterns:

```bash
# Debug specific issues
gh copilot explain "TypeScript compiler error: Property does not exist"

# Get implementation snippets
gh copilot suggest "implement React component with Material-UI"

# Testing and deployment commands
gh copilot suggest --type shell "run Jest tests with coverage report"
```

## Command Types & Examples

### Suggest Commands

```bash
# General suggestions
gh copilot suggest "optimize database queries"

# Shell-specific suggestions
gh copilot suggest --type shell "find large files in directory"

# Git-specific suggestions
gh copilot suggest --type git "merge feature branch safely"
```

### Explain Commands

```bash
# Explain complex commands
gh copilot explain "docker run -it --rm -v $(pwd):/app node:18"

# Explain code concepts
gh copilot explain "React useEffect dependency array"

# Explain error messages
gh copilot explain "npm ERR! peer dep missing"
```

## Configuration Options

### Available Settings

```bash
gh copilot config
```

Current configuration options:

- **Usage Analytics**: Allow GitHub to collect optional usage data
- **Command Execution**: Default confirmation behavior for command execution
- **No Model Selection**: Cannot choose different AI models

### Best Practices

1. **Context Matters**: Run commands from your project directory for better suggestions
2. **Be Specific**: More detailed queries yield better results
3. **Iterate**: Use explain to understand, then suggest to implement
4. **Combine Commands**: Chain planning and implementation queries

## Project-Specific Examples

For a React TypeScript project like this fruits-app:

```bash
# Planning phase
gh copilot explain "React component with Material-UI and TypeScript"
gh copilot suggest "add new feature to game schedule app"

# Implementation phase
gh copilot suggest "create TypeScript interface for game data"
gh copilot suggest --type shell "run Vite development server"

# Testing phase
gh copilot suggest --type shell "run Vitest tests with UI"
gh copilot explain "React Testing Library best practices"

# Deployment phase
gh copilot suggest --type shell "build React app for production"
gh copilot suggest "deploy to Netlify from CLI"
```

## Comparison with Other AI CLI Tools

| Feature           | GitHub Copilot CLI                 | Other Tools (aider, cursor)     |
| ----------------- | ---------------------------------- | ------------------------------- |
| **Model Choice**  | Fixed (GPT-4 family)               | Multiple models available       |
| **Local Models**  | No support                         | Some tools support local models |
| **Configuration** | Minimal options                    | Extensive model configuration   |
| **Integration**   | Deep GitHub integration            | General purpose                 |
| **Context**       | Git repo aware                     | Varies by tool                  |
| **Cost**          | Included with Copilot subscription | Varies (some free, some paid)   |

## Advanced Usage Tips

### 1. Workflow Integration

```bash
# Create aliases for common patterns
gh copilot alias

# Chain commands for complex workflows
gh copilot suggest "setup CI/CD pipeline for React app" && \
gh copilot explain "GitHub Actions workflow syntax"
```

### 2. Context Optimization

- Run from project root for better context
- Include file extensions in queries for language-specific help
- Reference specific frameworks/libraries in your queries

### 3. Error Resolution

```bash
# When stuck on errors
gh copilot explain "$(npm run build 2>&1 | tail -10)"

# For debugging
gh copilot suggest "debug React component rendering issues"
```

## Limitations & Considerations

### Current Limitations

- **No offline mode**: Requires internet connection
- **Fixed model**: Cannot switch to different AI models
- **Rate limiting**: May have usage limits based on subscription
- **Context window**: Limited context size for very large codebases

### Privacy Considerations

- Commands and queries are sent to GitHub's servers
- Optional usage analytics can be disabled
- Code context may be analyzed for better suggestions

## Future Developments

GitHub is likely to add:

- Model selection options
- Improved context understanding
- Better integration with GitHub features
- Enhanced local development support

---

_Last updated: $(date)_
_GitHub Copilot CLI Version: Latest available_
