# AI-Powered Loan Application Assistant: Technical Specifications

## 1. Project Overview

This document outlines the technical specifications for a multi-faceted, AI-powered web application designed to assist users throughout the loan application process. The application has two primary use cases:

- **Loan Estimate Comparison**: A tool for a detailed, side-by-side comparison of loan estimates from different lenders, with AI-driven recommendations.
- **Live Negotiation Assistant**: A real-time AI assistant that provides negotiation tactics during live phone conversations with loan officers by transcribing and analyzing the discussion.

## 2. Technology Stack

### Frontend: React.js
- **UI Library**: Tailwind CSS for styling
- **State Management**: React Context or Zustand for managing application state
- **Icons**: Lucide React

### Backend: Node.js
- **Framework**: Express.js for routing and API endpoints
- **Real-time Communication**: Socket.IO or WebSockets for chat and live transcription

### AI & Services:
- **LLM API**: Third-party LLM (e.g., Anthropic Claude) for analysis and recommendations
- **Speech-to-Text**: A real-time transcription service

## 3. Core Use Cases

### 3.1. Use Case 1: Loan Estimate Comparison

The user can upload or manually enter data from two different loan estimates. The application will perform a comparative analysis focusing on three core components:

- **Interest Rate**: The base rate offered
- **Points & Associated Fees**: Costs paid to lower the interest rate
- **All Other Fees**: Closing costs, origination fees, etc.

The AI will then process this information and generate a recommendation in the main panel, explaining which loan is financially advantageous and why.

### 3.2. Use Case 2: Live Negotiation Assistant

During a live phone call with a loan officer, the application will:

- Capture the audio and use a speech-to-text service to generate a live transcription of the conversation, which will be displayed on the right side of the screen
- Feed the live transcript to the AI model in real-time
- The AI will analyze the conversation and display actionable negotiation tactics and suggestions in the recommendation panel at the bottom of the screen, empowering the user during the call

## 4. User Interface (UI) and Layout

The application will have a three-part layout: a navigation sidebar, a main content area, and a communication panel on the right.

### 4.1. Sidebar Navigation

**Purpose**: Allows switching between the application's core functions.

**Items**:
- **Comparison**: Activates the loan estimate comparison view
- **Live Assistant**: Activates the real-time negotiation assistant view

**Behavior**: The selected mode will be highlighted and will reconfigure the main content and right-side panels.

### 4.2. Main Content Area

This area is vertically divided into two sections. Its content depends on the selected mode.

#### 4.2.1. Top Section

- **In Comparison Mode**: Displays a side-by-side view for Lender A and Lender B with fields for data input/upload
- **In Live Assistant Mode**: This area might display key metrics extracted from the conversation or could be hidden to give more focus to the recommendations

#### 4.2.2. Bottom Section: AI Recommendations

**Purpose**: Displays context-aware, AI-generated insights.

- **In Comparison Mode**: After user inputs data and clicks "Generate Analysis," this section shows a detailed breakdown of which loan is better and why
- **In Live Assistant Mode**: This section updates in real-time with negotiation tactics based on the live conversation transcript. Examples:
  - **"Suggestion"**: "Ask the loan officer if they can waive the application fee."
  - **"Clarification Needed"**: "Request a specific breakdown of the 'Processing Fee'."

### 4.3. Right Panel: Communication Hub

**Purpose**: Displays text-based communication, either typed or transcribed.

- **In Comparison Mode**: Functions as a standard Chat Interface for asynchronous text communication with a loan officer. User messages are on the right; officer messages are on the left.
- **In Live Assistant Mode**: Functions as a Live Transcription window, displaying the real-time dialogue between the user and the loan officer.

## 5. Data Flow and Backend Logic

### 5.1. Data Flow (Comparison Mode)

1. **User Input**: The user uploads or manually enters data for two loan estimates
2. **API Call**: The frontend sends the structured JSON data for both estimates to a backend endpoint (e.g., `/api/compare`)
3. **AI Analysis Request**: The Node.js backend formats the data into a prompt and sends it to the LLM API
4. **Return to Frontend**: The backend receives the analysis and sends the recommendations back to the frontend to be displayed

### 5.2. Data Flow (Live Assistant Mode)

1. **Audio Stream**: The frontend captures audio and streams it to the backend via WebSockets
2. **Real-time Transcription**: The backend pipes the audio stream to the speech-to-text service and receives text chunks back in real-time
3. **Broadcast Transcript**: The backend broadcasts the transcribed text to the frontend to be displayed in the right panel
4. **Real-time AI Analysis**: The backend continuously sends the updated transcript to the LLM API with a prompt to generate negotiation advice
5. **Broadcast Recommendations**: The AI's tactical suggestions are received by the backend and immediately broadcast to the frontend to be displayed in the bottom recommendation panel