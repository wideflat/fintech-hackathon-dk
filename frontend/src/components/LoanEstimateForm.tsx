import React, { useState } from "react";
import { LoanEstimate } from "../types";
import { useAppStore } from "../store/useAppStore";

interface LoanEstimateFormProps {
  lender: "lenderA" | "lenderB";
}

const LoanEstimateForm: React.FC<LoanEstimateFormProps> = ({ lender }) => {
  const { loanEstimates, setLoanEstimate } = useAppStore();
  const currentEstimate = loanEstimates[lender];

  const [formData, setFormData] = useState<Partial<LoanEstimate>>(
    currentEstimate || {
      lenderName: "",
      interestRate: 0,
      points: 0,
      pointsCost: 0,
      originationFee: 0,
      applicationFee: 0,
      processingFee: 0,
      underwritingFee: 0,
      appraisalFee: 0,
      titleInsurance: 0,
      escrowDeposit: 0,
      otherFees: 0,
      totalClosingCosts: 0,
      monthlyPayment: 0,
      loanAmount: 0,
      term: 30,
    }
  );

  const handleInputChange = (
    field: keyof LoanEstimate,
    value: string | number
  ) => {
    const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
    setFormData((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.lenderName && (formData.loanAmount || 0) > 0) {
      const estimate: LoanEstimate = {
        lenderName: formData.lenderName,
        interestRate: formData.interestRate || 0,
        points: formData.points || 0,
        pointsCost: formData.pointsCost || 0,
        originationFee: formData.originationFee || 0,
        applicationFee: formData.applicationFee || 0,
        processingFee: formData.processingFee || 0,
        underwritingFee: formData.underwritingFee || 0,
        appraisalFee: formData.appraisalFee || 0,
        titleInsurance: formData.titleInsurance || 0,
        escrowDeposit: formData.escrowDeposit || 0,
        otherFees: formData.otherFees || 0,
        totalClosingCosts: formData.totalClosingCosts || 0,
        monthlyPayment: formData.monthlyPayment || 0,
        loanAmount: formData.loanAmount || 0,
        term: formData.term || 30,
      };
      setLoanEstimate(lender, estimate);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          {lender === "lenderA" ? "Lender A" : "Lender B"} Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Lender Name
              </label>
              <input
                type="text"
                value={formData.lenderName || ""}
                onChange={(e) =>
                  handleInputChange("lenderName", e.target.value)
                }
                className="input-field"
                placeholder="Enter lender name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Loan Amount
              </label>
              <input
                type="number"
                value={formData.loanAmount || ""}
                onChange={(e) =>
                  handleInputChange("loanAmount", e.target.value)
                }
                className="input-field"
                placeholder="0"
                min="0"
                step="1000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Interest Rate (%)
              </label>
              <input
                type="number"
                value={formData.interestRate || ""}
                onChange={(e) =>
                  handleInputChange("interestRate", e.target.value)
                }
                className="input-field"
                placeholder="0.000"
                min="0"
                max="20"
                step="0.001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Loan Term (years)
              </label>
              <select
                value={formData.term || 30}
                onChange={(e) =>
                  handleInputChange("term", parseInt(e.target.value))
                }
                className="input-field"
              >
                <option value={15}>15 years</option>
                <option value={20}>20 years</option>
                <option value={30}>30 years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Monthly Payment
              </label>
              <input
                type="number"
                value={formData.monthlyPayment || ""}
                onChange={(e) =>
                  handleInputChange("monthlyPayment", e.target.value)
                }
                className="input-field"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Points and Fees */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Points
              </label>
              <input
                type="number"
                value={formData.points || ""}
                onChange={(e) => handleInputChange("points", e.target.value)}
                className="input-field"
                placeholder="0"
                min="0"
                max="5"
                step="0.125"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Points Cost
              </label>
              <input
                type="number"
                value={formData.pointsCost || ""}
                onChange={(e) =>
                  handleInputChange("pointsCost", e.target.value)
                }
                className="input-field"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Origination Fee
              </label>
              <input
                type="number"
                value={formData.originationFee || ""}
                onChange={(e) =>
                  handleInputChange("originationFee", e.target.value)
                }
                className="input-field"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Application Fee
              </label>
              <input
                type="number"
                value={formData.applicationFee || ""}
                onChange={(e) =>
                  handleInputChange("applicationFee", e.target.value)
                }
                className="input-field"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Processing Fee
              </label>
              <input
                type="number"
                value={formData.processingFee || ""}
                onChange={(e) =>
                  handleInputChange("processingFee", e.target.value)
                }
                className="input-field"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Additional Fees */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-secondary-800 mb-3">
            Additional Fees
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Underwriting Fee
              </label>
              <input
                type="number"
                value={formData.underwritingFee || ""}
                onChange={(e) =>
                  handleInputChange("underwritingFee", e.target.value)
                }
                className="input-field"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Appraisal Fee
              </label>
              <input
                type="number"
                value={formData.appraisalFee || ""}
                onChange={(e) =>
                  handleInputChange("appraisalFee", e.target.value)
                }
                className="input-field"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Title Insurance
              </label>
              <input
                type="number"
                value={formData.titleInsurance || ""}
                onChange={(e) =>
                  handleInputChange("titleInsurance", e.target.value)
                }
                className="input-field"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Escrow Deposit
              </label>
              <input
                type="number"
                value={formData.escrowDeposit || ""}
                onChange={(e) =>
                  handleInputChange("escrowDeposit", e.target.value)
                }
                className="input-field"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Other Fees
              </label>
              <input
                type="number"
                value={formData.otherFees || ""}
                onChange={(e) => handleInputChange("otherFees", e.target.value)}
                className="input-field"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Total Closing Costs
              </label>
              <input
                type="number"
                value={formData.totalClosingCosts || ""}
                onChange={(e) =>
                  handleInputChange("totalClosingCosts", e.target.value)
                }
                className="input-field"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="btn-primary w-full">
            Save {lender === "lenderA" ? "Lender A" : "Lender B"} Estimate
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoanEstimateForm;
