# Smart-Snap-Feast: Kitchen Wizard 🍳✨

![Frontend](https://img.shields.io/badge/Frontend-React-orange.svg)
![Styling](https://img.shields.io/badge/Styles-Tailwind_CSS-blue.svg)
![AI](https://img.shields.io/badge/AI-OpenAI,_Gemini_&_Chatbase-emerald.svg)
![Build](https://img.shields.io/badge/Build-Vite-purple.svg)
![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)

**Smart-Snap-Feast** is an AI-powered recipe generator that transforms your pantry ingredients into delicious, personalized meals. With a modern React-based UI, seamless AI integration, and a responsive design, it offers an interactive cooking experience tailored to your dietary preferences and cooking style.

## ✨ Core Features

- **🥘 Smart Ingredient Management**: Add and manage pantry ingredients with intuitive input interface
- **🤖 AI Recipe Generation**: Multi-AI powered recipe creation using OpenAI & Google Gemini
- **👨‍🍳 Interactive Cooking Mode**: Step-by-step guidance with progress tracking and real-time tips
- **🎯 Advanced Tip System**: Professional secrets, common mistake prevention, and flavor pairing advice
- **🍽️ Dietary Customization**: Support for vegetarian, vegan, gluten-free, keto, and custom preferences
- **📱 Recipe Management**: Save, share via email/social media, and export recipes as text files
- **🎨 Modern UI/UX**: Responsive React interface with Tailwind CSS and shadcn/ui components
- **🛡️ Robust Error Handling**: AI error boundaries and graceful fallback mechanisms
- **💬 AI Chatbot Integration**: Embedded cooking assistant via Chatbase for instant help
- **🔧 TypeScript Integration**: Type-safe development with comprehensive error validation

## 🚀 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **AI Integration**: OpenAI & Google Gemini APIs
- **AI Chatbot**: Chatbase Agent
- **State Management**: React Hooks
- **Package Manager**: Bun


## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Preveen369/smart-snap-feast.git
   cd smart-snap-feast
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_CHATBASE_API_KEY=your_chatbase_api_key_here
   NODE_ENV=development
   ```

   **Note**: OpenAI API key is required for recipe generation. Gemini API key is optional for enhanced features.
   Chatbase API key is required for the AI chatbot integration.

4. **Start the development server**

   ```bash
   bun dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🎯 Usage

1. **Add ingredients** — Add items from your pantry to the ingredient list.
2. **Set preferences & generate** — Pick dietary needs, time, difficulty, then generate a personalized recipe.
3. **Get smart tips & assistant** — Open Smart Cooking Tips for adaptive, recipe-specific guidance and use the Kitchen Wizard (Chatbase) chatbot for substitutions, nutrition info, troubleshooting, or step clarifications.
4. **Cook interactively** — Follow step-by-step cooking mode with timers, progress tracking, and actionable tips.
5. **Save & share** — Save recipes to your collection or share/export via email, socials, or download.

## 📁 Project Structure

```text
smart-snap-feast/
├── public/                     # Static assets (icons, images)
├── src/
│   ├── components/             # UI components (IngredientScanner, RecipeGenerator, TipPersonalizationPanel, ui)
│   ├── services/               # AI integrations & orchestration (openai, gemini, chatbase, ai)
│   ├── hooks/                  # Custom hooks (useLocalStorage, useToast, etc.)
│   ├── pages/                  # Page-level components (Index)
│   └── main.tsx                # App entry
├── training-knowledge-base/    # Chatbot training documents
├── vite.config.ts
├── package.json
└── README.md
```

## 🔧 Configuration

The app uses Vite for building and development. Key configuration files:

- `vite.config.ts` - Vite configuration
- `tailwind.config.ts` - Tailwind CSS configuration  
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration

## 🤖 AI Services

This application integrates with multiple AI services:

- **OpenAI**: For advanced recipe generation, cooking tips, and natural language processing
- **Google Gemini**: For recipe image generation and enhanced cooking suggestions
- **Chatbase**: For the embedded Kitchen Wizard chatbot — conversational assistance for ingredient substitutions, nutrition guidance, troubleshooting, and real‑time help

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Components

This project uses shadcn/ui for components. To add new components:

```bash
npx shadcn-ui@latest add [component-name]
```

## 🚀 Deployment

The app can be deployed to various platforms:

- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `dist` folder after building
- **GitHub Pages**: Use GitHub Actions for automated deployment

Build the project:

```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [OpenAI](https://openai.com/) for powerful AI capabilities
- [Google Gemini](https://ai.google.dev/) for advanced AI features
- [Vite](https://vitejs.dev/) for the blazing fast build tool

---

## Happy Cooking! 👨‍🍳👩‍🍳
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [OpenAI](https://openai.com/) for powerful AI capabilities
- [Google Gemini](https://ai.google.dev/) for advanced AI features
- [Vite](https://vitejs.dev/) for the blazing fast build tool

---

## Happy Cooking! 👨‍🍳👩‍🍳
