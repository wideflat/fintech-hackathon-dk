const express = require("express");
const Joi = require("joi");
const router = express.Router();
const logger = require("../utils/logger");

// Import Claude service only if available
let claudeService;
try {
  claudeService = require("../services/claudeService");
} catch (error) {
  logger.warn("Claude service not available for loan comparison");
  claudeService = null;
}

// Validation schema for loan estimate data
const loanEstimateSchema = Joi.object({
  lenderName: Joi.string().required().min(1).max(100),
  loanAmount: Joi.number().positive().required(),
  interestRate: Joi.number().positive().max(20).required(),
  term: Joi.number().integer().positive().max(50).required(),
  monthlyPayment: Joi.number().positive().required(),
  points: Joi.number().min(0).max(10).default(0),
  originationFee: Joi.number().min(0).default(0),
  processingFee: Joi.number().min(0).default(0),
  underwritingFee: Joi.number().min(0).default(0),
  totalClosingCosts: Joi.number().min(0).default(0),
});

// POST /api/loan-comparison/compare
// Compare two loan estimates and get AI recommendations
router.post("/compare", async (req, res) => {
  try {
    const { loanA, loanB } = req.body;

    // Validate input data
    const { error: errorA } = loanEstimateSchema.validate(loanA);
    if (errorA) {
      return res.status(400).json({
        success: false,
        error: "Invalid loan A data",
        details: errorA.details[0].message,
      });
    }

    const { error: errorB } = loanEstimateSchema.validate(loanB);
    if (errorB) {
      return res.status(400).json({
        success: false,
        error: "Invalid loan B data",
        details: errorB.details[0].message,
      });
    }

    logger.info("Comparing loan estimates", {
      lenderA: loanA.lenderName,
      lenderB: loanB.lenderName,
      loanAmountA: loanA.loanAmount,
      loanAmountB: loanB.loanAmount,
    });

    // Get AI comparison
    if (!claudeService) {
      return res.status(503).json({
        success: false,
        error: "AI service not available",
        details: "Claude API key not configured",
      });
    }

    const result = await claudeService.compareLoanEstimates(loanA, loanB);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to analyze loan estimates",
        details: result.error,
      });
    }

    res.json({
      success: true,
      data: result.analysis,
      rawResponse: result.rawResponse,
    });
  } catch (error) {
    logger.error("Error in loan comparison route:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
});

// POST /api/loan-comparison/analyze-single
// Analyze a single loan estimate for potential issues or opportunities
router.post("/analyze-single", async (req, res) => {
  try {
    const { loan } = req.body;

    // Validate input data
    const { error } = loanEstimateSchema.validate(loan);
    if (error) {
      return res.status(400).json({
        success: false,
        error: "Invalid loan data",
        details: error.details[0].message,
      });
    }

    logger.info("Analyzing single loan estimate", {
      lender: loan.lenderName,
      loanAmount: loan.loanAmount,
    });

    // Create a mock comparison with industry averages for analysis
    const industryAverage = {
      lenderName: "Industry Average",
      loanAmount: loan.loanAmount,
      interestRate: 6.5, // Example average rate
      term: loan.term,
      monthlyPayment: loan.loanAmount * 0.0065, // Rough estimate
      points: 0.5,
      originationFee: loan.loanAmount * 0.01,
      processingFee: 500,
      underwritingFee: 300,
      totalClosingCosts: loan.loanAmount * 0.02,
    };

    const result = await claudeService.compareLoanEstimates(
      loan,
      industryAverage
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to analyze loan estimate",
        details: result.error,
      });
    }

    res.json({
      success: true,
      data: result.analysis,
      rawResponse: result.rawResponse,
    });
  } catch (error) {
    logger.error("Error in single loan analysis route:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
});

// GET /api/loan-comparison/health
// Health check for the loan comparison service
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "loan-comparison",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
