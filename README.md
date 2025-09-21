# Mind Notes - AI-Powered Productivity App

A modern Chrome Extension + PWA for organizing thoughts and tasks with AI assistance and gamification.

## Features

### 🧠 Core Functionality
- **Task Management**: Create, organize, and track task lists
- **AI Assistant**: Get help organizing thoughts with OpenRouter AI integration
- **Level System**: Earn XP and level up by completing tasks
- **Local Storage**: All data saved locally for privacy

### 🎨 Design
- **Dark Carbon Theme**: Modern, developer-friendly dark interface
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive**: Works on desktop and mobile devices
- **Minimalist UI**: Clean, focused design for productivity

### 📱 Multi-Platform
- **Chrome Extension**: Install as a browser extension (Manifest V3)
- **Progressive Web App**: Install on mobile devices without app stores
- **Cross-Platform**: Works on Windows, Mac, Linux, iOS, Android

## Installation

### As Chrome Extension
1. Clone this repository
2. Run `npm install` and `npm run build`
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the `dist` folder

### As PWA (Mobile)
1. Visit the deployed app URL
2. Look for "Add to Home Screen" prompt
3. Install and use like a native app

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Storage**: localStorage
- **AI**: OpenRouter API (DeepSeek Chat)
- **PWA**: Service Worker + Web App Manifest
- **Chrome Extension**: Manifest V3

## Usage

### Notes Section
1. Click "Create" to add new task lists
2. Add multiple tasks to each list
3. Check off completed tasks
4. Complete all tasks to gain XP and level up

### AI Chat Section
1. Ask the AI to help organize your thoughts
2. Use suggested prompts or type your own
3. AI will create structured task lists for you
4. Lists automatically appear in the Notes section

### Level System
- Earn XP by completing task lists
- Level up with visual celebrations
- Track progress with the circular indicator

## Privacy

All data is stored locally in your browser. No personal information is sent to external servers except for AI chat requests to OpenRouter.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use and modify as needed.