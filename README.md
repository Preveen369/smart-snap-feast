# Smart-Snap-Feast: Kitchen Wizard 🍳✨

![Frontend](https://img.shields.io/badge/Frontend-React-orange.svg)
![Styling](https://img.shields.io/badge/Styles-Tailwind_CSS-blue.svg)
![AI](https://img.shields.io/badge/AI-OpenAI,_Gemini_&_Chatbase-emerald.svg)
![Build](https://img.shields.io/badge/Build-Vite-purple.svg)
![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)

**Smart-Snap-Feast** is an AI-powered recipe generator that transforms your pantry ingredients into delicious, personalized meals. With a modern React-based UI, seamless AI integration, and a responsive design, it offers an interactive cooking experience tailored to your dietary preferences and cooking style.

## ✨ Features

- **Smart Ingredient Management**: Easily add and manage ingredients from your pantry with manual input
- **AI Recipe Generation**: Get personalized recipe suggestions based on your available ingredients
- **Interactive Cooking Experience**: Step-by-step cooking mode with progress tracking and helpful tips
- **Dietary Preferences**: Filter recipes by vegetarian, vegan, gluten-free, keto and other dietary requirements
- **Recipe Customization**: Adjust servings, cooking time, and difficulty levels
- **Recipe Sharing**: Share recipes via email, social media, or download as text files
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Error Handling**: Robust error boundaries to ensure smooth user experience

## 🚀 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **AI Integration**: OpenAI & Google Gemini APIs
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
   ```

   **Note**: OpenAI API key is required for recipe generation. Gemini API key is optional for enhanced features.

4. **Start the development server**

   ```bash
   bun dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🎯 Usage

1. **Add Ingredients**: Manually add ingredients from your pantry to the ingredient list
2. **Set Preferences**: Choose dietary restrictions, cooking time, and difficulty level
3. **Generate Recipe**: Let AI create personalized recipes based on your ingredients and preferences
4. **Interactive Cooking**: Use the step-by-step cooking mode with tips and progress tracking
5. **Share & Save**: Share your favorite recipes or save them for later

## 📁 Project Structure

```text
kitchen-wizard/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── AIErrorBoundary.tsx     # Error handling component
│   │   ├── IngredientScanner.tsx   # Manual ingredient input
│   │   └── RecipeGenerator.tsx     # AI recipe generation & display
│   ├── hooks/              # Custom React hooks (useAI, useLocalStorage)
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components (Index, NotFound)
│   ├── services/           # AI service integrations (OpenAI, Gemini)
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
└── package.json
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
