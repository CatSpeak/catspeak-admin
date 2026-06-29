import React from "react";
import { Check, X } from "lucide-react";
import type { Plan } from "../../../entities/types";

interface PlanPreviewModalProps {
  plan: Plan;
  onClose: () => void;
}

const PlanPreviewModal: React.FC<PlanPreviewModalProps> = ({ plan, onClose }) => {
  // Prevent clicks inside the modal from closing it
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const isFree = plan.priceVnd === 0 && plan.priceUsd === 0 && plan.priceYuan === 0;

  // Format price and determine currency
  let displayPrice = "0";
  let currencySymbol = "";

  if (plan.priceVnd > 0) {
    displayPrice = plan.priceVnd.toLocaleString("vi-VN");
    currencySymbol = "đ";
  } else if (plan.priceUsd > 0) {
    displayPrice = plan.priceUsd.toLocaleString("en-US");
    currencySymbol = "$";
  } else if (plan.priceYuan > 0) {
    displayPrice = plan.priceYuan.toLocaleString("zh-CN");
    currencySymbol = "¥";
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        onClick={handleContentClick}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 flex flex-col h-full">
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {plan.planName || "Plan Name"}
            </h3>
            <p className="text-sm text-gray-500">
              {plan.description || "Plan description goes here."}
            </p>
          </div>

          {/* Price */}
          <div className="mb-8 flex items-baseline">
            <span className="text-[40px] leading-tight font-extrabold text-gray-900">
              {currencySymbol === "$" ? "$" : ""}
              {displayPrice}
              {currencySymbol !== "$" && !isFree ? ` ${currencySymbol}` : ""}
            </span>
            {!isFree && (
              <span className="ml-1 text-sm font-medium text-gray-500">
                /{plan.billingCycle === "Monthly" ? "Monthly" : plan.billingCycle}
              </span>
            )}
          </div>

          {/* Features */}
          <div className="flex-1 space-y-3.5 mb-8">
            {plan.subscriptionFeatures && plan.subscriptionFeatures.length > 0 ? (
              plan.subscriptionFeatures
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((feature) => (
                  <div key={feature.id || feature.featureCode} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 rounded-full p-0.5 bg-green-100 text-green-600">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {feature.featureName}
                      {feature.valueType !== "boolean" && feature.limitValue ? `: ${feature.limitValue}` : ""}
                    </span>
                  </div>
                ))
            ) : (
              <div className="text-sm text-gray-400 italic">No features added yet.</div>
            )}
          </div>

          {/* CTA Button */}
          <button
            className="w-full py-3.5 px-4 rounded-full font-bold text-sm transition-opacity hover:opacity-90 text-white shadow-sm"
            style={{ backgroundColor: plan.brandColor || "#7C3AED" }}
          >
            {isFree ? "Get Started for Free" : `Upgrade to ${plan.planName || "Pro"}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanPreviewModal;
