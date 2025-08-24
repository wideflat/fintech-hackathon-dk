const Anthropic = require("@anthropic-ai/sdk");
const logger = require("../utils/logger");

class ClaudeService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022";
  }

  /**
   * Compare two loan estimates and provide AI recommendations
   */
  async compareLoanEstimates(loanA, loanB) {
    try {
      const prompt = this.buildLoanComparisonPrompt(loanA, loanB);

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.1,
        system:
          "You are a financial advisor specializing in mortgage loans. Provide clear, actionable advice based on loan estimate comparisons. Focus on the financial impact and explain your reasoning clearly.",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const analysis = response.content[0].text;

      // Parse the response to extract structured data
      const structuredAnalysis = this.parseLoanComparisonResponse(analysis);

      return {
        success: true,
        analysis: structuredAnalysis,
        rawResponse: analysis,
      };
    } catch (error) {
      logger.error("Error in loan comparison:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get actionable negotiation suggestions for loan comparison
   */
  async getActionableSuggestions(loanA, loanB) {
    try {
      const prompt = this.buildActionableSuggestionsPrompt(loanA, loanB);

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 1000,
        temperature: 0.2,
        system:
          "You are a mortgage negotiation expert. Provide specific, actionable advice that borrowers can use immediately to improve their loan terms. Focus on concrete questions to ask lenders and specific concessions to request.",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const suggestions = this.parseActionableSuggestionsResponse(response.content[0].text);

      return {
        success: true,
        suggestions: suggestions,
        rawResponse: response.content[0].text,
      };
    } catch (error) {
      logger.error("Error generating actionable suggestions:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get real-time negotiation advice based on conversation transcript
   */
  async getNegotiationAdvice(transcript, context = {}) {
    try {
      const prompt = this.buildNegotiationPrompt(transcript, context);

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 1000,
        temperature: 0.3,
        system:
          "You are a real-time mortgage negotiation assistant. Provide tactical advice, questions to ask, and negotiation strategies based on the ongoing conversation. Be concise and actionable.",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const advice = response.content[0].text;

      // Parse the response to extract structured advice
      const structuredAdvice = this.parseNegotiationResponse(advice);

      return {
        success: true,
        advice: structuredAdvice,
        rawResponse: advice,
      };
    } catch (error) {
      logger.error("Error in negotiation advice:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Build prompt for loan comparison analysis
   */
  buildLoanComparisonPrompt(loanA, loanB) {
    return `
Please analyze these two loan estimates and provide a comprehensive comparison:

LOAN A (${loanA.lenderName}):
- Loan Amount: $${loanA.loanAmount}
- Interest Rate: ${loanA.interestRate}%
- Loan Term: ${loanA.term} years
- Monthly Payment: $${loanA.monthlyPayment}
- Points: ${loanA.points}
- Origination Fee: $${loanA.originationFee}
- Processing Fee: $${loanA.processingFee}
- Underwriting Fee: $${loanA.underwritingFee}
- Total Closing Costs: $${loanA.totalClosingCosts}

LOAN B (${loanB.lenderName}):
- Loan Amount: $${loanB.loanAmount}
- Interest Rate: ${loanB.interestRate}%
- Loan Term: ${loanB.term} years
- Monthly Payment: $${loanB.monthlyPayment}
- Points: ${loanB.points}
- Origination Fee: $${loanB.originationFee}
- Processing Fee: $${loanB.processingFee}
- Underwriting Fee: $${loanB.underwritingFee}
- Total Closing Costs: $${loanB.totalClosingCosts}

Please provide your analysis in the following JSON format:
{
  "recommendation": "LOAN_A" or "LOAN_B",
  "reasoning": "Detailed explanation of why this loan is better",
  "monthlySavings": "Monthly payment difference",
  "totalSavings": "Total cost difference over loan term",
  "keyDifferences": [
    {
      "category": "Interest Rate",
      "difference": "Description of the difference",
      "impact": "Financial impact"
    }
  ],
  "negotiationTips": [
    "Specific tips for negotiating with the recommended lender"
  ]
}
`;
  }

  /**
   * Build prompt for actionable suggestions
   */
  buildActionableSuggestionsPrompt(loanA, loanB) {
    return `
Analyze these two loan estimates and provide specific, actionable negotiation steps:

LOAN A (${loanA.lenderName}):
- Interest Rate: ${loanA.interestRate}%
- Points: ${loanA.points}
- Total Closing Costs: $${loanA.totalClosingCosts}
- Monthly Payment: $${loanA.monthlyPayment}

LOAN B (${loanB.lenderName}):
- Interest Rate: ${loanB.interestRate}%  
- Points: ${loanB.points}
- Total Closing Costs: $${loanB.totalClosingCosts}
- Monthly Payment: $${loanB.monthlyPayment}

Provide 3-5 specific actions the borrower should take to improve their position. Format as a simple bulleted list of actionable suggestions, such as:
• Ask [Lender Name] if they can match [specific rate/term]
• Request [Lender Name] to waive or reduce [specific fee/cost]
• Use [competing offer detail] as leverage with [Lender Name]

Focus on concrete questions to ask and specific concessions to request based on the differences between these offers.
`;
  }

  /**
   * Build prompt for real-time negotiation advice
   */
  buildNegotiationPrompt(transcript, context) {
    return `
Based on this ongoing conversation between a loan officer and customer, provide real-time negotiation advice:

CONVERSATION TRANSCRIPT:
${transcript}

CONTEXT:
- Loan Amount: ${context.loanAmount || "Not specified"}
- Current Interest Rate: ${context.currentRate || "Not specified"}
- Customer's Goals: ${context.customerGoals || "Not specified"}

Provide your advice in the following JSON format:
{
  "suggestions": [
    {
      "type": "question" | "tactic" | "warning" | "opportunity",
      "priority": "high" | "medium" | "low",
      "content": "Specific suggestion or question",
      "timing": "immediate" | "next" | "later"
    }
  ],
  "keyPoints": [
    "Important points to remember or bring up"
  ],
  "redFlags": [
    "Any concerning terms or conditions mentioned"
  ]
}
`;
  }

  /**
   * Parse loan comparison response into structured format
   */
  parseLoanComparisonResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback to structured text parsing
      return {
        recommendation: this.extractRecommendation(response),
        reasoning: response,
        monthlySavings: this.extractSavings(response, "monthly"),
        totalSavings: this.extractSavings(response, "total"),
        keyDifferences: this.extractDifferences(response),
        negotiationTips: this.extractTips(response),
      };
    } catch (error) {
      logger.error("Error parsing loan comparison response:", error);
      return {
        recommendation: "Unable to parse",
        reasoning: response,
        monthlySavings: "N/A",
        totalSavings: "N/A",
        keyDifferences: [],
        negotiationTips: [],
      };
    }
  }

  /**
   * Parse actionable suggestions response into structured format
   */
  parseActionableSuggestionsResponse(response) {
    try {
      // Parse bullet points from the response
      const lines = response.split('\n').filter(line => line.trim());
      const suggestions = [];
      
      for (const line of lines) {
        const trimmed = line.trim();
        // Look for bullet points (•, -, *, 1., etc.)
        if (trimmed.match(/^[•\-\*]|\d+\./) && trimmed.length > 10) {
          const cleanSuggestion = trimmed.replace(/^[•\-\*]|\d+\.\s*/, '').trim();
          if (cleanSuggestion) {
            suggestions.push(cleanSuggestion);
          }
        }
      }
      
      return suggestions;
    } catch (error) {
      logger.error("Error parsing actionable suggestions response:", error);
      return [];
    }
  }

  /**
   * Parse negotiation response into structured format
   */
  parseNegotiationResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback to structured text parsing
      return {
        suggestions: this.extractSuggestions(response),
        keyPoints: this.extractKeyPoints(response),
        redFlags: this.extractRedFlags(response),
      };
    } catch (error) {
      logger.error("Error parsing negotiation response:", error);
      return {
        suggestions: [],
        keyPoints: [],
        redFlags: [],
      };
    }
  }

  // Helper methods for parsing responses
  extractRecommendation(text) {
    if (text.toLowerCase().includes("loan a")) return "LOAN_A";
    if (text.toLowerCase().includes("loan b")) return "LOAN_B";
    return "UNCLEAR";
  }

  extractSavings(text, type) {
    const regex =
      type === "monthly"
        ? /\$[\d,]+\.?\d*\s*(?:per month|monthly)/i
        : /\$[\d,]+\.?\d*\s*(?:total|overall|lifetime)/i;
    const match = text.match(regex);
    return match ? match[0] : "N/A";
  }

  extractDifferences(text) {
    // Simple extraction of key differences
    const differences = [];
    const lines = text.split("\n");
    lines.forEach((line) => {
      if (
        line.includes("interest rate") ||
        line.includes("fee") ||
        line.includes("cost")
      ) {
        differences.push({
          category: "General",
          difference: line.trim(),
          impact: "Varies",
        });
      }
    });
    return differences;
  }

  extractTips(text) {
    const tips = [];
    const lines = text.split("\n");
    lines.forEach((line) => {
      if (
        line.toLowerCase().includes("ask") ||
        line.toLowerCase().includes("negotiate") ||
        line.toLowerCase().includes("request")
      ) {
        tips.push(line.trim());
      }
    });
    return tips;
  }

  extractSuggestions(text) {
    const suggestions = [];
    const lines = text.split("\n");
    lines.forEach((line) => {
      if (
        line.trim() &&
        (line.includes("?") || line.includes("ask") || line.includes("suggest"))
      ) {
        suggestions.push({
          type: "question",
          priority: "medium",
          content: line.trim(),
          timing: "next",
        });
      }
    });
    return suggestions;
  }

  extractKeyPoints(text) {
    const points = [];
    const lines = text.split("\n");
    lines.forEach((line) => {
      if (line.trim() && line.length > 10) {
        points.push(line.trim());
      }
    });
    return points.slice(0, 3); // Limit to 3 key points
  }

  extractRedFlags(text) {
    const flags = [];
    const lines = text.split("\n");
    lines.forEach((line) => {
      if (
        line.toLowerCase().includes("warning") ||
        line.toLowerCase().includes("concern") ||
        line.toLowerCase().includes("red flag")
      ) {
        flags.push(line.trim());
      }
    });
    return flags;
  }
}

module.exports = new ClaudeService();
