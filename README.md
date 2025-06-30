# Cognitive Persuasion Engine - Frontend

A modern React frontend for the Cognitive Persuasion Engine, built with Vite, Tailwind CSS, and shadcn/ui components.

## Features

- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- 🚀 **Fast Performance**: Powered by Vite for lightning-fast development
- 🔐 **Secure Authentication**: JWT-based user authentication
- 💼 **Business Management**: Create and manage multiple businesses
- 🎯 **Audience Targeting**: Manual and predefined audience selection
- 🤖 **AI Integration**: Real-time AI conversation interface
- 💳 **Payment Integration**: Credit-based payment system with PayPal

## Quick Deploy

### Deploy to Vercel (Recommended)
1. Fork this repository
2. Go to [Vercel](https://vercel.com) and import your repository
3. Set environment variables (see `.env.example`)
4. Deploy!

### Deploy to Netlify
1. Fork this repository
2. Go to [Netlify](https://netlify.com) and create a new site
3. Connect your GitHub repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Set environment variables
7. Deploy!

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

### Required Variables:
- `VITE_API_BASE_URL`: Your backend API URL (e.g., `https://your-api.onrender.com/api`)
- `VITE_PAYPAL_CLIENT_ID`: PayPal client ID for payments

### Optional Variables:
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version
- `VITE_ENABLE_ANALYTICS`: Enable analytics (true/false)
- `VITE_ENABLE_DEBUG`: Enable debug mode (true/false)

## Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ottmar1969/cognitive-persuasion-frontend.git
   cd cognitive-persuasion-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend API URL
   ```

4. **Start development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

The application will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
# or
pnpm build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AIResponseDisplay.jsx # AI response interface
│   ├── BusinessList.jsx     # Business management
│   ├── LiveChat.jsx         # Chat interface
│   └── AudienceSelector.jsx # Audience selection
├── pages/              # Page components
├── config.js           # Application configuration
├── mockApi.js          # Mock API for development
├── App.jsx             # Main application component
├── App.css             # Global styles
└── main.jsx            # Application entry point
```

## Key Features

### Business Management
- Create unlimited custom business types
- Predefined industry templates
- Business-specific AI response generation
- Scalable architecture for growth

### Target Audience Management
- Manual audience input with natural language descriptions
- Predefined audience categories
- Professional tabbed interface
- AI understands context from descriptions

### AI Integration
- Real-time AI conversations
- Multiple AI agents (Logic, Emotion, Creative, Authority, Social Proof)
- Contextual responses based on business and audience
- Credit-based usage tracking

### Payment System
- Credit-based pricing model
- PayPal integration
- Multiple package options with volume discounts
- Real-time balance tracking

## Deployment Platforms

### Vercel (Recommended for React)
- Automatic deployments from GitHub
- Global CDN
- Custom domains
- Environment variable management
- Preview deployments for pull requests

### Netlify
- Git-based deployments
- Form handling
- Serverless functions
- Custom domains
- Branch deployments

### GitHub Pages
- Free hosting for static sites
- Custom domains supported
- Automatic deployments via GitHub Actions

## Environment Configuration

### Development
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ENABLE_DEBUG=true
```

### Production
```env
VITE_API_BASE_URL=https://your-backend-api.onrender.com/api
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

## Technologies Used

- **React 19** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact [your-email@example.com] or create an issue on GitHub.

