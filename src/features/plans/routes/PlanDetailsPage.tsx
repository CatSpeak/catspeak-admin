import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  Save,
  Eye,
  Send,
  Lock,
  EyeOff,
  Archive,
  ChevronRight,
  Trash2,
} from "lucide-react"
import { usePlanDetails } from "../hooks/usePlanDetails"
import { usePlanMutations } from "../hooks/usePlanMutations"
import PlanGeneralTab from "../components/PlanGeneralTab"
import PlanFeaturesTab from "../components/PlanFeaturesTab"
import PlanPreviewModal from "../components/PlanPreviewModal"
import PageLoader from "../../../routes/PageLoader"
import Button from "../../../components/ui/Button"
import { formatDate, formatDateTime } from "../../../lib/utils"
import type { Plan } from "../../../entities/types"

const PlanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const isCreateMode = !id
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = (searchParams.get("tab") as any) || "general"

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
  const pendingStatusRef = useRef<string | undefined>(undefined)

  if (loading && !isCreateMode) return <PageLoader />
  if (!isCreateMode && (error || !plan)) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load plan details or plan not found.
      </div>
    )
  }

  const handleSaveGeneralInfo = async (formData: FormData) => {
    if (pendingStatusRef.current)
      formData.set("PackageStatus", pendingStatusRef.current)
    setIsSaving(true)
    const success = await updateGeneralInfo(formData)
    setIsSaving(false)
    pendingStatusRef.current = undefined
    if (success) {
      console.log("Saved successfully")
    }
    return success
  }

  const handleCreateGeneralInfo = async (formData: FormData) => {
    if (pendingStatusRef.current)
      formData.set("PackageStatus", pendingStatusRef.current)
    const result = await createPlan(formData)
    pendingStatusRef.current = undefined
    if (result) {
      navigate(`/plans/${result.planId}?tab=features`)
      return true
    }
    return false
  }

  const triggerSave = (status?: string) => {
    if (status) pendingStatusRef.current = status
    if (activeTab === "general") {
      const formSubmitButton = document.getElementById("submit-general-tab")
      if (formSubmitButton) {
        formSubmitButton.click()
      }
    } else {
      console.log("Features auto-save on change.")
    }
  }

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this plan? This action cannot be undone.",
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
          <nav className="flex items-center text-xs font-semibold tracking-wider text-gray-400 mb-4">
            <span
              onClick={() => navigate("/plans")}
              className="cursor-pointer hover:text-primary transition-colors"
            >
              Plans
            </span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-gray-600">
              {isCreateMode ? "Create New Plan" : "Plan Details"}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {isCreateMode ? "Create New Plan" : currentPlan?.planName}
                </h1>
                {!isCreateMode && currentPlan && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-200/60 shadow-sm">
                      {currentPlan.applicableRole}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-700 rounded-md border border-gray-200 shadow-sm">
                      {currentPlan.packageStatus || "Draft"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                {isCreateMode ? (
                  <span>Create a new service package to offer to users</span>
                ) : currentPlan ? (
                  <>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <span className="font-semibold text-gray-700">Code:</span>
                      <span className="font-mono text-gray-900">
                        {currentPlan.subscriptionCode}
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                    <div>
                      Created{" "}
                      <span className="font-medium text-gray-700">
                        {formatDate(currentPlan.createDate)}
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                    <div>
                      Updated{" "}
                      <span className="font-medium text-gray-700">
                        {formatDateTime(currentPlan.lastEdited)}
                      </span>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {!isCreateMode &&
              currentPlan &&
              currentPlan.packageStatus !== "Published" && (
                <div className="flex items-center shrink-0">
                  <Button
                    variant="primary"
                    onClick={() => triggerSave("Published")}
                    disabled={isSaving || isSubmitting}
                    className="shadow-sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {currentPlan.packageStatus === "Draft"
                      ? "Publish Plan"
                      : "Republish Plan"}
                  </Button>
                </div>
              )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 shrink-0">
          <nav className="flex items-center gap-8 px-2">
            <button
              onClick={() => handleTabChange("general")}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "general"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              1. General Information
            </button>
            <button
              onClick={() => !isCreateMode && handleTabChange("features")}
              disabled={isCreateMode}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "features"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } ${isCreateMode ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isCreateMode && <Lock className="w-4 h-4" />}
              2. Features & Benefits
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 pb-6">
          {activeTab === "general" && currentPlan && (
            <PlanGeneralTab
              plan={currentPlan}
              onSave={
                isCreateMode ? handleCreateGeneralInfo : handleSaveGeneralInfo
              }
              isSaving={isSaving || isSubmitting}
              isCreateMode={isCreateMode}
            />
          )}
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

        {/* Bottom Action Bar */}
        <div className="sticky bottom-6 z-10 py-5 mt-auto border border-gray-200 rounded-xl bg-white flex items-center justify-end gap-3 px-4 shadow-md">
          {/* Right side: Primary actions */}
          <div className="flex items-center gap-3">
            {!isCreateMode &&
              currentPlan &&
              currentPlan.packageStatus !== "Published" && (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
                </>
              )}
            {isCreateMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/plans")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => triggerSave("Draft")}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Plan & Go to Config"}
                </Button>
              </>
            ) : (
              <>
                {currentPlan?.packageStatus === "Published" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => triggerSave("Hidden")}
                      disabled={isSaving}
                    >
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => triggerSave("Archived")}
                      disabled={isSaving}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                  </>
                )}

                <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>

                {currentPlan?.packageStatus === "Draft" ? (
                  <Button
                    variant="primary"
                    onClick={() => triggerSave("Draft")}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save as Draft"}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => triggerSave()}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
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
