# AI-Powered Loan Application Assistant - Frontend

A modern React application for comparing loan estimates and providing real-time negotiation assistance during loan officer calls.

## Features

### 🏦 Loan Estimate Comparison

- Side-by-side comparison of loan estimates from different lenders
- Comprehensive form for entering loan details (rates, fees, closing costs)
- AI-powered analysis and recommendations
- Detailed breakdown of savings and cost differences

### 🎤 Live Negotiation Assistant

- Real-time audio transcription during phone calls
- AI-generated negotiation suggestions and tactics
- Live conversation analysis with confidence scoring
- Quick action buttons for common negotiation points

### 💬 Chat Integration

- Asynchronous chat with loan officers
- Message history and real-time updates
- Professional communication interface

## Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Lucide React** for icons
- **Socket.IO Client** for real-time communication

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will open at `http://localhost:3000`

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Project Structure

```
src/
├── components/          # React components
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── ComparisonView.tsx # Loan comparison interface
│   ├── LiveAssistantView.tsx # Live negotiation assistant
│   ├── LoanEstimateForm.tsx # Loan data input forms
│   ├── ComparisonResult.tsx # AI analysis results
│   ├── TranscriptionPanel.tsx # Live transcription display
│   ├── NegotiationSuggestions.tsx # AI suggestions
│   └── ChatPanel.tsx   # Chat interface
├── store/              # State management
│   └── useAppStore.ts  # Zustand store
├── types/              # TypeScript type definitions
│   └── index.ts        # Application types
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

## Key Components

### Comparison Mode

- **LoanEstimateForm**: Comprehensive form for entering loan details
- **ComparisonResult**: Displays AI analysis with recommendations
- **ChatPanel**: Asynchronous communication with loan officers

### Live Assistant Mode

- **TranscriptionPanel**: Real-time conversation display
- **NegotiationSuggestions**: AI-generated negotiation advice
- **LiveAssistantView**: Main interface for live calls

## State Management

The application uses Zustand for state management with the following key state:

- `mode`: Current application mode ('comparison' | 'live-assistant')
- `loanEstimates`: Loan data for both lenders
- `comparisonResult`: AI analysis results
- `transcriptionMessages`: Live conversation transcript
- `negotiationSuggestions`: Real-time AI suggestions
- `chatMessages`: Chat history with loan officers

## API Integration

The frontend is designed to integrate with a Node.js backend that provides:

- `/api/compare` - Loan estimate comparison analysis
- WebSocket connection for real-time transcription
- AI analysis endpoints for negotiation suggestions

## Styling

The application uses Tailwind CSS with a custom design system:

- **Primary Colors**: Blue palette for main actions
- **Secondary Colors**: Gray palette for UI elements
- **Semantic Colors**: Green (success), Yellow (warning), Red (error)
- **Responsive Design**: Mobile-first approach with breakpoints

## Development

### Adding New Features

1. Create new components in `src/components/`
2. Add TypeScript types in `src/types/index.ts`
3. Update the Zustand store in `src/store/useAppStore.ts`
4. Add any new routes or navigation items

### Code Style

- Use TypeScript for all components
- Follow React functional component patterns
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for async operations

## Deployment

The application can be deployed to any static hosting service:

1. Build the application:

```bash
npm run build
```

2. Deploy the `build/` folder to your hosting service

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is part of the AI-Powered Loan Application Assistant hackathon project.
