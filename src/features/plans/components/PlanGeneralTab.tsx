import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import type { Plan } from '../../../entities/types';
import Button from '../../../components/ui/Button';

interface PlanGeneralTabProps {
  plan: Plan;
  onSave: (formData: FormData) => Promise<boolean>;
  isSaving: boolean;
}

const PlanGeneralTab: React.FC<PlanGeneralTabProps> = ({ plan, onSave, isSaving }) => {
  const [isPaid, setIsPaid] = useState(plan.priceVnd > 0);
  const [allowRenewal, setAllowRenewal] = useState(plan.allowRenewal !== false);
  const [autoRenew, setAutoRenew] = useState(plan.autoRenew || false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Append boolean/calculated values that might not be in inputs
    if (!isPaid) {
      formData.set("PriceVnd", "0");
      formData.set("PriceUsd", "0");
      formData.set("PriceYuan", "0");
    }
    formData.set("AllowRenewal", allowRenewal ? "true" : "false");
    formData.set("AutoRenew", (allowRenewal && autoRenew) ? "true" : "false");

    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: General Info */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">General Information</h2>
            <p className="text-sm text-gray-500">Edit basic information of the plan.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
              <input
                required
                name="PlanName"
                maxLength={100}
                defaultValue={plan.planName}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code (Cannot be edited)</label>
              <input
                disabled
                defaultValue={plan.subscriptionCode}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              name="Description"
              maxLength={255}
              defaultValue={plan.description || plan.shortDescription}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role (Cannot be edited)</label>
              <input
                disabled
                defaultValue={plan.applicableRole}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="PackageStatus"
                defaultValue={plan.packageStatus || "Draft"}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Hidden">Hidden</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon *</label>
              <input
                type="file"
                name="iconFile"
                accept=".png,.jpg,.jpeg,.svg"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG. Max 2MB</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="BrandColor"
                    defaultValue={plan.brandColor || "#7C3AED"}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-sm font-medium text-gray-700">{plan.brandColor || "#7C3AED"}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order *</label>
                <input
                  type="number"
                  name="DisplayOrder"
                  min="1"
                  defaultValue={plan.displayOrder || 1}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column: Pricing & Cycle */}
      <div className="space-y-6">
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">Price & Cycle Settings</h2>
            <p className="text-sm text-gray-500">Configure price, cycle and payment options for the plan.</p>
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="PricingType"
                    checked={!isPaid}
                    onChange={() => setIsPaid(false)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Free</span>
                </div>
                {!isPaid && <span className="text-sm font-bold">0 VND</span>}
              </label>
              
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="PricingType"
                    checked={isPaid}
                    onChange={() => setIsPaid(true)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Paid</span>
                </div>
                {isPaid && (
                  <div className="flex items-center gap-2 w-32">
                    <input
                      type="number"
                      name="PriceVnd"
                      required={isPaid}
                      min="1"
                      defaultValue={plan.priceVnd > 0 ? plan.priceVnd : ''}
                      className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg text-right"
                    />
                    <span className="text-sm font-medium">VND</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Cycle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cycle</label>
            <div className="grid grid-cols-2 gap-3">
              {['Monthly', 'Quarterly', 'Yearly', 'Lifetime'].map(cycle => (
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Options</label>
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
              
              <label className={`flex items-center gap-2 ${!isPaid ? 'opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={allowRenewal}
                  onChange={(e) => {
                    setAllowRenewal(e.target.checked);
                    if (!e.target.checked) setAutoRenew(false);
                  }}
                  disabled={!isPaid}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-sm">Allow Renewal</span>
              </label>

              <label className={`flex items-center gap-2 ${!allowRenewal ? 'opacity-50' : 'cursor-pointer'}`}>
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
  );
};

export default PlanGeneralTab;
