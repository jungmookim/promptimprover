# 🚀 AI Prompt Improver

This web app helps you iterate and improve on LLM prompts through a friendly interface.


## ✨ Features

- **🔄 Side-by-side Comparison**: View current and improved prompt versions with their generated responses
- **💬 Smart Feedback Integration**: Provide specific feedback to guide improvements
- **📈 Iterative Improvement**: Generate multiple improvement iterations based on your feedback
- **✏️ Interactive Editing**: Edit improved prompts directly
- **📊 Change Analysis**: See exactly what was improved with intelligent "What changed" summaries
- **📚 History Tracking**: View all previous prompt versions in an organized history section
- **🎨 Responsive Design**: Fun, responsive interface built on Next.js that works on desktop and mobile

## 📸 Screenshots

### Initial Prompt Entry
![Initial Interface](https://github.com/user/attachments/assets/screenshot1-url-here)
*Entering your initial prompt*

### Side-by-Side Comparison
![Prompt Comparison](https://github.com/user/attachments/assets/screenshot2-url-here)
*Compare your original and improved prompts with their responses side by side*

## 🛠️ Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: CSS framework for rapid styling
- **OpenAI API**: Easily hook in any model from OpenAI
- **React Hooks**: Modern state management and UI interactions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed on your machine
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-prompt-improver.git
   cd ai-prompt-improver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000` and start improving your prompts!

## 📖 How to Use

### Basic Workflow

1. **📝 Enter your initial prompt** in the text area on the homepage
2. **🚀 Click "Improve Prompt"** to generate both the original response and an improved version
3. **👀 Compare results** side by side in the two-panel interface
4. **✏️ Edit the improved prompt** directly if needed (button changes to "Improve Prompt" when edited)
5. **💭 Add specific feedback** describing how you'd like the prompt further refined
6. **✅ Accept or ❌ Reject** the improvement to continue iterating
7. **📚 View history** of all previous prompt iterations

### Advanced Features

- **Smart Feedback**: The AI incorporates your feedback while preserving your original writing style
- **Change Analysis**: See bullet-point summaries of what was improved
- **Edit Protection**: Get confirmation dialogs when rejecting prompts with unsaved edits
- **Keyboard Shortcuts**: Use Ctrl+Enter to quickly submit prompts and feedback

## 🏗️ Project Structure

```
ai-prompt-improver/
├── app/
│   ├── api/
│   │   ├── analyze-changes/
│   │   │   └── route.ts          # API for analyzing prompt improvements
│   │   ├── generate/
│   │   │   └── route.ts          # API for generating responses
│   │   └── improve/
│   │       └── route.ts          # API for improving prompts
│   ├── globals.css               # Global styles and animations
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Main application logic
├── components/
│   ├── PromptCard.tsx            # Reusable prompt/response card
│   └── HistorySection.tsx        # Collapsible history component
├── .env.local.example            # Environment variables template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies and scripts
└── README.md                     # You are here!
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **🍴 Fork the repository**
2. **🌟 Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **💾 Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **📤 Push to the branch** (`git push origin feature/amazing-feature`)
5. **🔃 Open a Pull Request**

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

**Made with ❤️ by [Jungmoo Kim](https://github.com/jungmookim)**

*Star ⭐ this repository if you find it helpful!*