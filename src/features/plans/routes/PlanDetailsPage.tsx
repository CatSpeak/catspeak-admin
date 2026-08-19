import React, { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Eye, Send, Lock, EyeOff, Archive, Trash2, Save, Loader2 } from "lucide-react"
import { usePlanDetails } from "../hooks/usePlanDetails"
import { usePlanMutations } from "../hooks/usePlanMutations"
import PlanGeneralTab from "../components/PlanGeneralTab"
import PlanFeaturesTab from "../components/PlanFeaturesTab"
import PlanPreviewModal from "../components/PlanPreviewModal"
import PageLoader from "../../../routes/PageLoader"
import Breadcrumb from "../../../components/ui/Breadcrumb"
import PageTitle from "../../../components/ui/PageTitle"
import Tabs from "../../../components/ui/Tabs"
import { formatDateTime } from "../../../lib/utils"
import type { Plan } from "../../../entities/types"
import { useLanguage } from "../../../stores/languageStore"

const PlanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const isCreateMode = !id
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = (searchParams.get("tab") as any) || "general"
  const { t } = useLanguage()

  const [activeTab, setActiveTab] = useState<"general" | "features">(initialTab)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Sync tab if URL changes
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) setActiveTab(tab as any)
  }, [searchParams])

  const handleTabChange = (tab: "general" | "features") => {
    setActiveTab(tab)
    if (tab === "general") {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete("tab")
      setSearchParams(newParams)
    } else {
      setSearchParams({ tab })
    }
  }

  const { createPlan, deletePlan, isSubmitting } = usePlanMutations()
  const {
    plan,
    availableFeatures,
    loading,
    error,
    updateGeneralInfo,
    addFeature,
    updateFeature,
    removeFeature,
    updateStatus,
  } = usePlanDetails(isCreateMode ? undefined : Number(id))

  const emptyPlan = {
    planId: 0,
    planName: "",
    description: "",
    priceVnd: 0,
    priceUsd: 0,
    priceYuan: 0,
    createDate: new Date().toISOString(),
    lastEdited: new Date().toISOString(),
    status: 1,
    subscriptionCode: "",
    applicableRole: "",
    brandColor: "#7C3AED",
    displayOrder: 1,
    iconUrl: "",
    shortDescription: "",
    billingCycle: "Monthly",
    allowRenewal: true,
    autoRenew: false,
    packageStatus: "Draft",
    subscriptionFeatures: [],
  } as unknown as Plan

  const currentPlan = isCreateMode ? emptyPlan : plan

  if (loading && !isCreateMode) return <PageLoader />
  if (!isCreateMode && (error || !plan)) {
    return (
      <div className="p-6 text-center text-red-500">
        {t.plans.loadError}
      </div>
    )
  }

  const handleSaveGeneralInfo = async (formData: FormData) => {
    setIsSaving(true)
    const success = await updateGeneralInfo(formData)
    setIsSaving(false)
    if (success) {
      console.log("Saved successfully")
    }
    return success
  }

  const handleCreateGeneralInfo = async (formData: FormData) => {
    formData.set("PackageStatus", "Draft")
    const result = await createPlan(formData)
    if (result) {
      navigate(`/plans/${result.planId}?tab=features`)
      return true
    }
    return false
  }

  const handleUpdateStatus = async (status: string) => {
    setIsSaving(true)
    await updateStatus(status)
    setIsSaving(false)
  }

  const triggerSave = () => {
    const formSubmitButton = document.getElementById("submit-general-tab")
    if (formSubmitButton) {
      formSubmitButton.click()
    }
  }

  const handleDelete = async () => {
    if (
      window.confirm(
        t.plans.confirmDelete,
      )
    ) {
      setIsSaving(true)
      const success = await deletePlan(Number(id))
      setIsSaving(false)
      if (success) {
        navigate("/plans")
      }
    }
  }

  return (
    <div className="flex flex-col min-h-full animate-fade-in">
      <div className="w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-8 shrink-0">
          <Breadcrumb
            items={[
              { label: t.plans.title, onClick: () => navigate("/plans") },
              { label: isCreateMode ? t.plans.createPlan : t.plans.planDetails },
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <PageTitle>
                {isCreateMode ? t.plans.createPlan : currentPlan?.planName}
              </PageTitle>
              {!isCreateMode && currentPlan && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-200/60 shadow-sm">
                    {currentPlan.applicableRole}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-700 rounded-md border border-gray-200 shadow-sm">
                    {currentPlan.packageStatus || t.plans.draft}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm text-gray-500">
                {isCreateMode ? (
                  <span>{t.plans.createPlanSub}</span>
                ) : currentPlan ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span>{t.plans.code}:</span>
                      <span className="font-medium text-gray-700">
                        {currentPlan.subscriptionCode}
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                    <div>
                      {t.plans.created}{" "}
                      <span className="font-medium text-gray-700">
                        {formatDateTime(currentPlan.createDate)}
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                    <div>
                      {t.plans.updated}{" "}
                      <span className="font-medium text-gray-700">
                        {formatDateTime(currentPlan.lastEdited)}
                      </span>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: "general", label: t.plans.tabGeneral },
            {
              id: "features",
              label: t.plans.tabFeatures,
              icon: isCreateMode ? <Lock className="w-4 h-4" /> : undefined,
              disabled: isCreateMode,
            },
          ]}
          activeTab={activeTab}
          onChange={(id) => handleTabChange(id as "general" | "features")}
          className="mb-6"
        />

        {/* Tab Content */}
        <div className="flex-1 pb-6">
          <div className={activeTab === "general" ? "block" : "hidden"}>
            {currentPlan && (
              <PlanGeneralTab
                plan={currentPlan}
                onSave={
                  isCreateMode ? handleCreateGeneralInfo : handleSaveGeneralInfo
                }
                isSaving={isSaving || isSubmitting}
                isCreateMode={isCreateMode}
              />
            )}
          </div>
          {activeTab === "features" && currentPlan && !isCreateMode && (
            <PlanFeaturesTab
              plan={currentPlan}
              availableFeatures={availableFeatures}
              onAddFeature={addFeature}
              onUpdateFeature={updateFeature}
              onRemoveFeature={removeFeature}
            />
          )}
        </div>

        {/* Bottom Action Bar (Unified for Create and Edit/Details modes) */}
        <div className="sticky bottom-0 z-30 bg-white py-3.5 -mb-4 md:-mb-6 -mx-4 md:-mx-6 px-4 md:px-6 flex flex-wrap items-center justify-between gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] mt-auto">
          {/* Left side actions */}
          <div>
            {isCreateMode ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => navigate("/plans")}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {t.common?.cancel || "Hủy"}
              </button>
            ) : (
              currentPlan &&
              currentPlan.packageStatus !== "Published" && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.plans.deletePlan}
                </button>
              )
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {isCreateMode ? (
              <button
                type="button"
                disabled={isSubmitting || isSaving}
                onClick={triggerSave}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                {(isSubmitting || isSaving) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {isSubmitting || isSaving
                  ? t.plans.creating
                  : t.plans.createAndConfig}
              </button>
            ) : (
              <>
                {/* Save button when on general tab in edit mode */}
                {activeTab === "general" && (
                  <button
                    type="button"
                    onClick={triggerSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {currentPlan?.packageStatus === "Draft"
                      ? isSaving
                        ? t.plans.saving
                        : t.plans.saveDraft
                      : isSaving
                        ? t.plans.saving
                        : t.plans.saveChanges}
                  </button>
                )}

                {/* Hide / Archive if published */}
                {currentPlan?.packageStatus === "Published" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("Hidden")}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                    >
                      <EyeOff className="w-4 h-4" />
                      {t.plans.hide}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("Archived")}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                      {t.plans.archive}
                    </button>
                  </>
                )}

                {/* Preview button */}
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  {t.plans.preview}
                </button>

                {/* Publish button if not published */}
                {currentPlan?.packageStatus !== "Published" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("Published")}
                    disabled={isSaving || isSubmitting}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white text-xs sm:text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {currentPlan?.packageStatus === "Draft"
                      ? t.plans.publishPlan
                      : t.plans.republishPlan}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {isPreviewOpen && currentPlan && (
        <PlanPreviewModal
          plan={currentPlan}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  )
}

export default PlanDetailsPage
