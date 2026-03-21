# Repomix-Splitter

Repomix-Splitter is designed for users working with Large Language Models (LLMs) that have limited context windows.
This package enables you to minify and split a large input into multiple segments, each packaged with instructions for the LLM not to analyze the content immediately. Instead, the LLM is prompted to wait until the final segment is received before beginning its analysis.

**Key Features:**
- Breaks down large inputs to fit within LLM context limitations
- Each split contains information instructing the LLM to hold off analysis
- Once the last split is provided, the LLM is directed to process the combined input

**How It Works:**
1. Your input is split into manageable chunks.
2. Each chunk is sent to the LLM with instructions to “wait for the final message.”
3. After all splits are provided, the final instruction tells the LLM to begin analysis.

## Table of Contents
- [Installation](#installation)
- [Node.js Version](#nodejs-version)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Installation

To get started with Repomix-Splitter, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/Sunil23391/repomix-splitter.git
   ```

2. Navigate to the project directory:
   ```bash
   cd repomix-splitter
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Node.js Version

This project requires **Node.js version 24**.

### Setup Instructions

**Using nvm (recommended):**
```bash
nvm install 24
nvm use 24
```

**Manual Setup (Windows):**
```bash
set PATH=C:\Software\node-v24.13.1-win-x64\node-v24.13.1-win-x64
```

## Usage

[Add usage instructions for your project here]

## Screenshots

Here's a glimpse of the application's interface:

![App Screenshot](https://github.com/user-attachments/assets/21af212e-ef83-41eb-9f90-3dfbda2d6bdd)

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for bug reports and feature requests.

## License

[Add your license information here]