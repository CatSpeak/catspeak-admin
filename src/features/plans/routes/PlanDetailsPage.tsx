import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Send } from 'lucide-react';
import { usePlanDetails } from '../hooks/usePlanDetails';
import PlanGeneralTab from '../components/PlanGeneralTab';
import PlanFeaturesTab from '../components/PlanFeaturesTab';
import PageLoader from '../../../routes/PageLoader';
import Button from '../../../components/ui/Button';

const PlanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'features' | 'history'>('general');
  const [isSaving, setIsSaving] = useState(false);

  const { 
    plan, 
    availableFeatures, 
    loading, 
    error, 
    updateGeneralInfo,
    addFeature,
    updateFeature,
    removeFeature
  } = usePlanDetails(Number(id));

  if (loading) return <PageLoader />;
  if (error || !plan) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load plan details or plan not found.
      </div>
    );
  }

  const handleSaveGeneralInfo = async (formData: FormData) => {
    setIsSaving(true);
    const success = await updateGeneralInfo(formData);
    setIsSaving(false);
    if (success) {
      // Optional: show a toast notification
      console.log('Saved successfully');
    }
    return success;
  };

  const triggerSave = () => {
    if (activeTab === 'general') {
      const formSubmitButton = document.getElementById('submit-general-tab');
      if (formSubmitButton) {
        formSubmitButton.click();
      }
    } else {
      // If we are on features tab, it auto-saves, but user might click Save anyway.
      // We can just show a success message or navigate.
      console.log("Features auto-save on change.");
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      
      <div className="max-w-7xl mx-auto w-full py-6 flex-1 flex flex-col">
        {/* Header */}
      <div className="flex items-start justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/plans")}
            className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{plan.planName}</h1>
              <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {plan.applicableRole}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium bg-orange-50 text-orange-600 rounded-full border border-orange-200">
                {plan.packageStatus || 'Draft'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <span>Code: {plan.subscriptionCode}</span>
              <span>•</span>
              <span>Created: {new Date(plan.createDate).toLocaleDateString()}</span>
              <span>•</span>
              <span>Last updated: {new Date(plan.lastEdited).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Copy
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 shrink-0">
        <nav className="flex items-center gap-8 px-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'general' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            1. General Information
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'features' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            2. Features & Benefits
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            3. Change History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 pb-6">
        {activeTab === 'general' && (
          <PlanGeneralTab 
            plan={plan} 
            onSave={handleSaveGeneralInfo} 
            isSaving={isSaving} 
          />
        )}
        {activeTab === 'features' && (
          <PlanFeaturesTab 
            plan={plan} 
            availableFeatures={availableFeatures} 
            onAddFeature={addFeature}
            onUpdateFeature={updateFeature}
            onRemoveFeature={removeFeature}
          />
        )}
        {activeTab === 'history' && (
          <div className="flex items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            Change history will be updated later.
          </div>
        )}
        </div>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 z-10 py-4 mt-auto border border-gray-200 rounded-t-md bg-white flex items-center justify-end gap-3 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button variant="outline" onClick={triggerSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="primary">
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsPage;
