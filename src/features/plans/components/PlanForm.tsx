import React, { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import type { Plan } from "../../../entities/types";

interface PlanFormProps {
  initialData?: Plan;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const PlanForm: React.FC<PlanFormProps> = ({ initialData, onSubmit, isSubmitting, onCancel }) => {
  const [iconPreview, setIconPreview] = useState<string | null>(initialData?.iconUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    setIconPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
      {/* Main Form Content */}
      <div className="flex-1 space-y-6">
        {/* Basic Info Section */}
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-1">1. Basic Information</h2>
          <p className="text-sm text-gray-500 mb-6">Enter the fundamental details of the plan.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
              <input
                required
                name="PlanName"
                maxLength={100}
                defaultValue={initialData?.planName}
                placeholder="e.g. Room Pro"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Code *</label>
              <input
                required
                name="SubscriptionCode"
                maxLength={50}
                defaultValue={initialData?.subscriptionCode}
                placeholder="e.g. ROOM_PRO"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Role *</label>
              <select
                required
                name="ApplicableRole"
                defaultValue={initialData?.applicableRole || ""}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="" disabled>Select Role</option>
                <option value="Learner">Learner</option>
                <option value="Teacher">Teacher</option>
                <option value="Club">Club</option>
                <option value="Business">Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type *</label>
              <select
                required
                name="PlanType"
                defaultValue="Paid"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Paid">Paid</option>
                <option value="Free">Free</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                required
                name="PackageStatus"
                defaultValue={initialData?.packageStatus || "Draft"}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <textarea
              name="ShortDescription"
              maxLength={255}
              defaultValue={initialData?.shortDescription}
              rows={3}
              placeholder="A brief summary for users..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            ></textarea>
          </div>
        </Card>

        {/* Display Info Section */}
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-1">2. Display Information (Optional)</h2>
          <p className="text-sm text-gray-500 mb-6">Visual assets for the plan.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Icon</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors h-40 flex flex-col items-center justify-center cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="iconFile"
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {iconPreview ? (
                  <div className="relative w-full h-full p-2 group">
                    <img src={iconPreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); clearFile(); }}
                      className="absolute top-1 right-1 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium text-gray-900">Upload Icon</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG up to 2MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Other display configs */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
                <div className="flex items-center border border-gray-200 rounded-lg px-2 bg-white">
                  <input
                    type="color"
                    name="BrandColor"
                    defaultValue={initialData?.brandColor || "#F5A623"}
                    className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue={initialData?.brandColor || "#F5A623"}
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  name="DisplayOrder"
                  defaultValue={initialData?.displayOrder || 0}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers display first.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar Content */}
      <div className="lg:w-80 space-y-6">
        <Card className="bg-gray-50 border-transparent">
          <h3 className="font-semibold text-gray-900 mb-4">Plan Creation Process</h3>
          <ul className="space-y-4 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            <li className="relative flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold ring-4 ring-orange-50 z-10">1</div>
              <div>
                <p className="font-medium text-sm text-gray-900">Basic Configuration</p>
                <p className="text-xs text-gray-500">Fill in plan details</p>
              </div>
            </li>
            <li className="relative flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold ring-4 ring-gray-50 z-10">2</div>
              <div>
                <p className="font-medium text-sm text-gray-500">Feature Setup (Soon)</p>
                <p className="text-xs text-gray-400">Configure specific limits</p>
              </div>
            </li>
          </ul>
        </Card>

        <Card className="bg-blue-50 border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm">Notes</h3>
          <ul className="text-xs text-blue-800 space-y-2 list-disc pl-4">
            <li>Fields marked with (*) are required.</li>
            <li>Plans created in "Draft" status are not visible to users.</li>
          </ul>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Create Plan & Go to Config"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PlanForm;
