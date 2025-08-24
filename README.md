# Fintech Hackathon - Loan Comparison and Negotiation Assistant

A comprehensive loan comparison tool with real-time AI negotiation assistance for borrowers.

## Features

- **Loan Comparison**: Compare multiple loan estimates side by side
- **PDF Data Extraction**: Automatically extract loan details from PDF documents
- **Live Negotiation Assistant**: Real-time AI assistance during loan officer calls
- **WebRTC Integration**: Voice communication with OpenAI Realtime API
- **Event Logging**: Track all real-time communication events

## Project Structure

```
fintech-hackathon-dk/
├── package.json          # Root package.json with concurrently
├── frontend/
│   ├── src/               # React TypeScript application
│   ├── public/
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── index.js           # Express server for API token generation
│   ├── package.json
│   ├── .env               # Backend environment (OPENAI_API_KEY)
│   └── .env.example
└── data/
    └── *.pdf files        # Sample loan estimate PDFs
```

## Quick Start

### 1. Install All Dependencies

```bash
npm run install-all
```

This will install dependencies for:
- Root package (concurrently)
- Frontend (React app)  
- Backend (Express server)

### 2. Set Up Environment Variables

#### Backend Configuration
Copy the backend environment example and add your OpenAI API key:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
FRONTEND_URL=http://localhost:3000
```

#### Frontend Configuration (Optional)
The frontend `.env` is optional, but you can customize the backend URL:

```bash
# frontend/.env
REACT_APP_BACKEND_URL=http://localhost:3001
```

### 3. Start Development Servers

```bash
npm run dev
```

This single command will start:
- **Frontend** on http://localhost:3000 (React app)
- **Backend** on http://localhost:3001 (Express API server)

The terminal output will be color-coded:
- 🟡 **BACKEND** (yellow) - Express server logs
- 🔵 **FRONTEND** (cyan) - React development server logs

### 4. Extract Loan Data (Optional)

To extract loan data from PDFs:

```bash
cd data
pip install -r requirements.txt
python data_extractor.py
```

## Available Scripts

### Root Scripts
- `npm run dev` - Start both frontend and backend
- `npm run frontend` - Start only frontend
- `npm run backend` - Start only backend
- `npm run install-all` - Install all project dependencies
- `npm run clean` - Remove all node_modules directories

### Frontend Scripts (in /frontend)
- `npm start` - Start React development server
- `npm run build` - Build React app for production
- `npm test` - Run React tests

### Backend Scripts (in /backend)
- `npm start` - Start Express server
- `npm run dev` - Start Express server with nodemon

## Development Workflow

1. **Start Development**: `npm run dev`
2. **Make Changes**: Edit files in `frontend/src/` or `backend/`
3. **View Changes**: Frontend auto-reloads, backend restarts with nodemon
4. **Stop Servers**: Ctrl+C stops both servers

## Features Overview

### Loan Comparison Mode
- Upload and compare multiple loan estimates
- Automatic PDF data extraction
- Side-by-side comparison with recommendations

### Live Negotiation Assistant
- Real-time WebRTC voice communication
- AI-powered negotiation suggestions
- Event logging for all communications
- Session management with start/stop controls

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Zustand
- **Backend**: Express.js, Node.js
- **AI Integration**: OpenAI Realtime API
- **Communication**: WebRTC for voice, WebSocket for data
- **Data Processing**: Python with PyPDF2

## Getting OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `backend/.env` file

## Troubleshooting

### "Connection Refused" Error
- Ensure backend server is running: `npm run backend`
- Check if port 3001 is available
- Verify OPENAI_API_KEY is set in `backend/.env`

### Frontend Won't Start
- Check if port 3000 is available
- Run `npm install` in the frontend directory
- Clear cache: `rm -rf frontend/node_modules/.cache`

### Backend API Errors
- Verify OpenAI API key is valid
- Check internet connection
- Review backend logs for detailed error messages

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly with `npm run dev`
5. Submit a pull request

## License

MIT License - see LICENSE file for details