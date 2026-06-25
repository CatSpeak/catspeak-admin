import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import type { Plan, SubscriptionFeature } from '../../../entities/types';
import { Search, Plus, Trash2, Edit2 } from 'lucide-react';

interface PlanFeaturesTabProps {
  plan: Plan;
  availableFeatures: SubscriptionFeature[];
  onAddFeature: (featureData: any) => Promise<boolean>;
  onUpdateFeature: (featureId: number, featureData: any) => Promise<boolean>;
  onRemoveFeature: (featureId: number) => Promise<boolean>;
}

const PlanFeaturesTab: React.FC<PlanFeaturesTabProps> = ({ 
  plan, 
  availableFeatures,
  onAddFeature,
  onUpdateFeature,
  onRemoveFeature
}) => {
  const [search, setSearch] = useState('');

  const safeAvailableFeatures = Array.isArray(availableFeatures) ? availableFeatures : [];
  
  // Filter available features based on search
  const filteredAvailable = safeAvailableFeatures.filter(f => 
    f?.featureName?.toLowerCase().includes(search.toLowerCase()) || 
    f?.featureCode?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (feature: SubscriptionFeature) => {
    // Default config when adding
    onAddFeature({
      featureCode: feature.featureCode,
      featureName: feature.featureName,
      limitValue: feature.limitValue || "0",
      isActive: true,
      displayOrder: 1
    });
  };

  const handleToggleStatus = (feature: SubscriptionFeature) => {
    onUpdateFeature(feature.id, {
      featureName: feature.featureName,
      limitValue: feature.limitValue,
      isActive: !feature.isActive,
      displayOrder: feature.displayOrder
    });
  };

  const handleLimitChange = (feature: SubscriptionFeature, newValue: string) => {
    onUpdateFeature(feature.id, {
      featureName: feature.featureName,
      limitValue: newValue,
      isActive: feature.isActive,
      displayOrder: feature.displayOrder
    });
  };

  const configuredFeatures = plan.subscriptionFeatures || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Available Features List */}
      <div className="lg:col-span-1">
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">Features List</h2>
            <p className="text-sm text-gray-500">Select features to add to the plan</p>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            {filteredAvailable.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No features found.</p>
            ) : (
              filteredAvailable.map(feature => {
                const isAdded = configuredFeatures.some(cf => cf.featureCode === feature.featureCode);
                return (
                  <div key={feature.id} className={`flex items-start justify-between p-3 rounded-lg border ${isAdded ? 'border-primary/20 bg-primary/5' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{feature.featureName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{feature.featureCode}</p>
                    </div>
                    <button
                      disabled={isAdded}
                      onClick={() => handleAdd(feature)}
                      className={`p-1.5 rounded-md ${isAdded ? 'text-primary' : 'text-gray-400 hover:text-primary hover:bg-primary/10'} transition-colors`}
                    >
                      {isAdded ? <span className="text-xs font-medium">Added</span> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Right Column: Configured Features Table */}
      <div className="lg:col-span-2">
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">Configured Features ({configuredFeatures.length})</h2>
            <p className="text-sm text-gray-500">Features and limits currently applied to this plan</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500 uppercase text-xs">Feature</th>
                  <th className="px-4 py-3 font-medium text-gray-500 uppercase text-xs">Code</th>
                  <th className="px-4 py-3 font-medium text-gray-500 uppercase text-xs w-32">Limit</th>
                  <th className="px-4 py-3 font-medium text-gray-500 uppercase text-xs text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500 uppercase text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {configuredFeatures.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No features have been configured for this plan yet.
                    </td>
                  </tr>
                ) : (
                  configuredFeatures.map(feature => (
                    <tr key={feature.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{feature.featureName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{feature.featureCode}</td>
                      <td className="px-4 py-3">
                        {feature.valueType === 'boolean' ? (
                          <span className="text-gray-400 italic">N/A</span>
                        ) : (
                          <input 
                            type="text" 
                            defaultValue={feature.limitValue}
                            onBlur={(e) => {
                              if (e.target.value !== feature.limitValue) {
                                handleLimitChange(feature, e.target.value);
                              }
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={feature.isActive}
                            onChange={() => handleToggleStatus(feature)}
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-gray-400 hover:text-primary transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onRemoveFeature(feature.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default PlanFeaturesTab;
