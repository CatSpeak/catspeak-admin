import React, { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Eye, Send, Lock, EyeOff, Archive, Trash2 } from "lucide-react"
import { usePlanDetails } from "../hooks/usePlanDetails"
import { usePlanMutations } from "../hooks/usePlanMutations"
import PlanGeneralTab from "../components/PlanGeneralTab"
import PlanFeaturesTab from "../components/PlanFeaturesTab"
import PlanPreviewModal from "../components/PlanPreviewModal"
import PageLoader from "../../../routes/PageLoader"
import Button from "../../../components/ui/Button"
import Breadcrumb from "../../../components/ui/Breadcrumb"
import PageTitle from "../../../components/ui/PageTitle"
import Tabs from "../../../components/ui/Tabs"
import { formatDateTime } from "../../../lib/utils"
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
        Failed to load plan details or plan not found.
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
          <Breadcrumb
            items={[
              { label: "Plans", onClick: () => navigate("/plans") },
              { label: isCreateMode ? "Create New Plan" : "Plan Details" },
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <PageTitle>
                {isCreateMode ? "Create New Plan" : currentPlan?.planName}
              </PageTitle>
              {!isCreateMode && currentPlan && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-200/60 shadow-sm">
                    {currentPlan.applicableRole}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-700 rounded-md border border-gray-200 shadow-sm">
                    {currentPlan.packageStatus || "Draft"}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm text-gray-500">
                {isCreateMode ? (
                  <span>Create a new service package to offer to users</span>
                ) : currentPlan ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span>Code:</span>
                      <span className="font-medium text-gray-700">
                        {currentPlan.subscriptionCode}
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                    <div>
                      Created{" "}
                      <span className="font-medium text-gray-700">
                        {formatDateTime(currentPlan.createDate)}
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
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: "general", label: "1. General Information" },
            {
              id: "features",
              label: "2. Features & Benefits",
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
                  onClick={() => triggerSave()}
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
                      onClick={() => handleUpdateStatus("Hidden")}
                      disabled={isSaving}
                    >
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus("Archived")}
                      disabled={isSaving}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>

                {currentPlan?.packageStatus !== "Published" && (
                  <Button
                    variant="primary"
                    onClick={() => handleUpdateStatus("Published")}
                    disabled={isSaving || isSubmitting}
                    className="shadow-sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {currentPlan?.packageStatus === "Draft"
                      ? "Publish Plan"
                      : "Republish Plan"}
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
