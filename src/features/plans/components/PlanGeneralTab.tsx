import React, { useState, useEffect } from "react"
import { usePlans } from "../hooks/usePlans"
import Card from "../../../components/ui/Card"
import type { Plan } from "../../../entities/types"

interface PlanGeneralTabProps {
  plan: Plan
  onSave: (formData: FormData) => Promise<boolean>
  isSaving: boolean
  isCreateMode?: boolean
}

const PlanGeneralTab: React.FC<PlanGeneralTabProps> = ({ plan, onSave, isCreateMode }) => {
  const { plans } = usePlans()
  const [isPaid, setIsPaid] = useState(plan.priceVnd > 0 || plan.priceUsd > 0 || plan.priceYuan > 0)
  const [currencyType, setCurrencyType] = useState<'VND' | 'USD' | 'CNY'>(plan.priceUsd > 0 ? 'USD' : plan.priceYuan > 0 ? 'CNY' : 'VND')
  const [allowRenewal, setAllowRenewal] = useState(plan.allowRenewal !== false)
  const [autoRenew, setAutoRenew] = useState(plan.autoRenew || false)
  const [displayOrder, setDisplayOrder] = useState<number>(plan.displayOrder || 1)
  const [brandColor, setBrandColor] = useState(plan.brandColor || "#7C3AED")
  const [previewIconUrl, setPreviewIconUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewIconUrl) URL.revokeObjectURL(previewIconUrl)
    }
  }, [previewIconUrl])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Append boolean/calculated values that might not be in inputs
    const priceValue = Number(formData.get("PriceValue") || 0)

    // Reset all to 0
    formData.set("PriceVnd", "0")
    formData.set("PriceUsd", "0")
    formData.set("PriceYuan", "0")

    if (isPaid) {
      if (currencyType === "VND") formData.set("PriceVnd", priceValue.toString())
      if (currencyType === "USD") formData.set("PriceUsd", priceValue.toString())
      if (currencyType === "CNY") formData.set("PriceYuan", priceValue.toString())
    }
    formData.set("AllowRenewal", allowRenewal ? "true" : "false")
    formData.set("AutoRenew", allowRenewal && autoRenew ? "true" : "false")
    if (!isCreateMode) {
      formData.set("SubscriptionCode", plan.subscriptionCode)
      formData.set("ApplicableRole", plan.applicableRole)
    }

    formData.set("IconUrl", plan.iconUrl || "")

    await onSave(formData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Left Column: General Info */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                General Information
              </h2>
              <p className="text-sm text-gray-500">
                Edit basic information of the plan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="PlanName"
                maxLength={100}
                defaultValue={plan.planName}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isCreateMode ? <>Code <span className="text-red-500">*</span></> : "Code (Cannot be edited)"}
              </label>
              <input
                disabled={!isCreateMode}
                name={isCreateMode ? "SubscriptionCode" : undefined}
                defaultValue={plan.subscriptionCode}
                className={`w-full px-3 py-2 border border-gray-200 rounded-lg ${!isCreateMode ? 'bg-gray-50 text-gray-500' : 'focus:outline-none focus:ring-1 focus:ring-primary uppercase'}`}
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              name="Description"
              maxLength={255}
              defaultValue={plan.description}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isCreateMode ? <>Role <span className="text-red-500">*</span></> : "Role (Cannot be edited)"}
              </label>
              {isCreateMode ? (
                <select
                  required
                  name="ApplicableRole"
                  defaultValue={plan.applicableRole || ""}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="" disabled>Select Role</option>
                  <option value="Learner">Learner</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Club">Club</option>
                  <option value="Business">Business</option>
                </select>
              ) : (
                <input
                  disabled
                  defaultValue={plan.applicableRole}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon <span className="text-red-500">*</span>
              </label>
              {(previewIconUrl || plan.iconUrl) && (
                <div className="mb-2">
                  <img src={previewIconUrl || plan.iconUrl} alt="Plan Icon Preview" className="w-16 h-16 object-contain border border-gray-200 rounded-lg p-1 bg-white" />
                </div>
              )}
              <input
                type="file"
                name="iconFile"
                accept=".png,.jpg,.jpeg,.svg"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setPreviewIconUrl(URL.createObjectURL(file))
                  } else {
                    setPreviewIconUrl(null)
                  }
                }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, SVG. Max 2MB
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Color <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="BrandColor"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-sm font-medium text-gray-700 uppercase">
                  {brandColor}
                </span>
              </div>
            </div>
            
            {/* Visual Display Order Preview */}
            {plans && (
              <div className="mt-8 col-span-1 md:col-span-2 pt-6 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Display Sequence</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Control the order this plan appears on the pricing page.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Position <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="DisplayOrder"
                      min="1"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                      className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold"
                    />
                  </div>
                </div>
                
                {plans.length > 0 && (
                  <div className="flex gap-4 overflow-x-auto py-2 px-2 items-center">
                    {(() => {
                      // Create a visual sequence of plans
                      // Exclude the current plan from the fetched list so we can insert it at the desired position
                      const otherPlans = plans.filter(p => p.planId !== plan.planId).sort((a, b) => a.displayOrder - b.displayOrder);
                      const previewPlans = [...otherPlans];
                      
                      // Insert current plan at displayOrder - 1
                      const insertIndex = Math.max(0, Math.min(previewPlans.length, displayOrder - 1));
                      previewPlans.splice(insertIndex, 0, { ...plan, planName: plan.planName || "New Plan", isCurrentEditing: true } as any);

                      return previewPlans.map((p: any, idx) => (
                        <div 
                          key={p.planId === plan.planId ? 'current' : p.planId} 
                          className={`flex-shrink-0 w-28 h-20 rounded-lg border flex flex-col items-center justify-center p-2 text-center transition-all ${
                            p.isCurrentEditing 
                              ? 'bg-primary/10 border-primary text-primary font-bold shadow-md scale-105 z-10' 
                              : 'bg-white border-gray-200 text-gray-500 shadow-sm opacity-75'
                          }`}
                        >
                          <span className="truncate w-full text-xs mb-1">{p.planName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.isCurrentEditing ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                            Position {idx + 1}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Right Column: Pricing & Cycle */}
      <div className="space-y-6">
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Price & Cycle Settings
            </h2>
            <p className="text-sm text-gray-500">
              Configure price, cycle and payment options for the plan.
            </p>
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="PricingType"
                  checked={!isPaid}
                  onChange={() => setIsPaid(false)}
                  className="text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-sm font-medium cursor-pointer">Free</span>
              </label>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="PricingType"
                    checked={isPaid}
                    onChange={() => setIsPaid(true)}
                    className="text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium cursor-pointer">Paid</span>
                </label>
                {isPaid && (
                  <div className="flex items-center gap-2 pl-6 animate-fade-in">
                    <input
                      type="number"
                      name="PriceValue"
                      required={isPaid}
                      min="1"
                      placeholder="0"
                      key={currencyType}
                      defaultValue={
                        currencyType === 'USD' ? (plan.priceUsd || "") : 
                        currencyType === 'CNY' ? (plan.priceYuan || "") : 
                        (plan.priceVnd || "")
                      }
                      className="w-full sm:w-32 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-left focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <select
                      value={currencyType}
                      onChange={(e) => setCurrencyType(e.target.value as any)}
                      className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="VND">VND</option>
                      <option value="USD">USD</option>
                      <option value="CNY">Yuan</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cycle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cycle
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["Monthly", "Quarterly", "Yearly", "Lifetime"].map((cycle) => (
                <label key={cycle} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="BillingCycle"
                    value={cycle}
                    defaultChecked={plan.billingCycle === cycle}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{cycle}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Options
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  disabled
                  className="rounded text-primary focus:ring-primary opacity-50"
                />
                <span className="text-sm">Allow Purchase</span>
              </label>

              <div>
                <label
                  className={`flex items-center gap-2 ${!isPaid ? "opacity-50" : "cursor-pointer"}`}
                >
                  <input
                    type="checkbox"
                    checked={allowRenewal}
                    onChange={(e) => {
                      setAllowRenewal(e.target.checked)
                      if (!e.target.checked) setAutoRenew(false)
                    }}
                    disabled={!isPaid}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Allow Renewal</span>
                </label>
                {!isPaid && (
                  <p className="text-[11px] text-gray-400 mt-1 pl-6">
                    (Only applicable to paid plans)
                  </p>
                )}
              </div>

              <label
                className={`flex items-center gap-2 ${!allowRenewal ? "opacity-50" : "cursor-pointer"}`}
              >
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  disabled={!allowRenewal}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-sm">Auto Renew</span>
              </label>
            </div>
          </div>
        </Card>
      </div>

      {/* Hidden button so we can submit via ref or externally */}
      <button type="submit" id="submit-general-tab" className="hidden"></button>
    </form>
  )
}

export default PlanGeneralTab
