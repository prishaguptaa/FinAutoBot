"use client"

import { useState, useEffect } from "react"
import { UserOverview } from "@/components/user-overview"
import { LifeEventAlerts } from "@/components/life-event-alerts"
import { PortfolioRecommendation } from "@/components/portfolio-recommendation"
import { AddEventForm } from "@/components/add-event-form"
import { BankStatementUpload } from "@/components/bank-statement-upload"
import { EventDetailModal } from "@/components/event-detail-modal"
import { GoalSelectionForm } from "@/components/goal-selection-form"
import { AppHeader } from "@/components/app-header"
import { FinancialInsights } from "@/components/financial-insights"
import type { LifeEvent, Goal } from "@/lib/types"
import { sampleLifeEvents, sampleGoals } from "@/lib/sample-data"

export default function Home() {
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(sampleLifeEvents)
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null)
  const [showAddEventForm, setShowAddEventForm] = useState(false)
  const [showBankUpload, setShowBankUpload] = useState(false)
  const [showEventDetail, setShowEventDetail] = useState(false)
  const [showGoalSelection, setShowGoalSelection] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [userRiskProfile, setUserRiskProfile] = useState<"aggressive" | "moderate" | "conservative">("moderate")
  const [monthlySurplus, setMonthlySurplus] = useState(50000)
  const [apiRecommendations, setApiRecommendations] = useState<any>(null)
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [detectedEventInfo, setDetectedEventInfo] = useState<{ eventName: string, reasoning: string } | undefined>(undefined)

  useEffect(() => {
    // Simulate loading delay for animation purposes
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Check if any modal is open
    const isAnyModalOpen = showAddEventForm || showBankUpload || showEventDetail || showGoalSelection || showUploadModal;
    
    // Prevent scrolling on the body when a modal is open
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showAddEventForm, showBankUpload, showEventDetail, showGoalSelection, showUploadModal]);

  const handleConfirmEvent = (eventId: string) => {
    setLifeEvents(lifeEvents.map((event) => (event.id === eventId ? { ...event, status: "confirmed" as const } : event)))
    const confirmedEvent = lifeEvents.find((event) => event.id === eventId)
    if (confirmedEvent) {
      setSelectedEvent(confirmedEvent)
      setShowGoalSelection(true)
    }
  }

  const handleRejectEvent = (eventId: string) => {
    setLifeEvents(lifeEvents.map((event) => (event.id === eventId ? { ...event, status: "rejected" as const } : event)))
  }

  const handleAddEvent = (newEvent: Omit<LifeEvent, "id">) => {
    const id = `event-${lifeEvents.length + 1}`
    const event = { ...newEvent, id, status: "pending" }
    setLifeEvents([...lifeEvents, event])
    setShowAddEventForm(false)
  }

  const handleViewEventDetails = (event: LifeEvent) => {
    setSelectedEvent(event)
    setShowEventDetail(true)
  }

  const handleGoalSelection = async (goals: Goal[]) => {
    setSelectedGoals(goals)
    setShowGoalSelection(false)
    
    // Call API for recommendations
    try {
      setIsLoadingRecommendations(true)
      
      // Format the goals as expected by the API
      const apiGoals = goals.map(goal => ({
        goal_name: goal.name,
        target_amount: goal.targetAmount,
        target_years: goal.timeframe
      }))
      
      const requestBody = {
        user_id: "user123",
        risk_profile: userRiskProfile,
        goals: apiGoals
      }
      
      console.log("Requesting recommendations with:", requestBody)
      
      const response = await fetch("http://localhost:3000/recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("API recommendation response:", data)
      setApiRecommendations(data)
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  // Create a LifeEvent type that matches the type definition
  const createEvent = (
    id: string,
    title: string,
    type: string,
    explanation: string,
    detailedExplanation: string,
    detectedDate: string,
    confidence: number
  ): LifeEvent => {
    return {
      id,
      title,
      type,
      explanation,
      detailedExplanation,
      detectedDate,
      confidence,
      status: "pending"
    };
  };

  const handleBankStatementUpload = (file: File, eventInfo?: { eventName: string, reasoning: string }) => {
    // Store detected event information if provided
    if (eventInfo) {
      setDetectedEventInfo(eventInfo);
      console.log("Setting detected event info:", eventInfo);
      
      // Create a new event based on the detected event type
      const eventType = eventInfo.eventName;
      
      // Map detected event name to event type and title
      let eventTitle = "Event Detected";
      let eventTypeCode: "newBaby" | "jobChange" | "wedding" | "homePurchase" = "homePurchase"; // default
      
      if (eventType === "newBaby") {
        eventTitle = "New Baby Detected";
        eventTypeCode = "newBaby";
      } else if (eventType === "jobChange") {
        eventTitle = "Job Change Detected";
        eventTypeCode = "jobChange";
      } else if (eventType === "wedding") {
        eventTitle = "Wedding Planning Detected";
        eventTypeCode = "wedding";
      } else if (eventType === "homePurchase") {
        eventTitle = "Home Purchase Detected";
        eventTypeCode = "homePurchase";
      }
      
      // Add a new event directly
      const id = `event-${lifeEvents.length + 1}`;
      const newEvent: LifeEvent = {
        id,
        title: eventTitle,
        type: eventTypeCode,
        explanation: "Detected from your bank statement.",
        detailedExplanation: eventInfo.reasoning,
        detectedDate: new Date().toISOString().split("T")[0],
        confidence: 92,
        status: "pending",
      };

      setLifeEvents([...lifeEvents, newEvent]);
      
      // Use the new event to set the selected event
      setSelectedEvent(newEvent);
      
      // Show the event details modal
      setShowBankUpload(false);
      setShowEventDetail(true);
    } else {
      // Simulate detecting new events after a delay (fallback behavior)
      setTimeout(() => {
        const id = `event-${lifeEvents.length + 1}`;
        const newEvent: LifeEvent = {
          id,
          title: "Home Purchase Detected",
          type: "homePurchase",
          explanation: "Large down payment transaction detected. Multiple searches for real estate websites.",
          detailedExplanation:
            "Our analysis detected a significant outflow of ₹500,000 to a property developer on July 15th. Additionally, we noticed multiple visits to real estate websites and mortgage calculators in your browsing history. These patterns strongly suggest you're in the process of purchasing a home.",
          detectedDate: new Date().toISOString().split("T")[0],
          confidence: 92,
          status: "pending",
        };

        setLifeEvents([...lifeEvents, newEvent]);
        setShowBankUpload(false);
      }, 2000);
    }
  }

  const handleUploadStatement = () => {
    setShowUploadModal(true)
  }

  const handleUploadSuccess = (filename: string, eventInfo?: { eventName: string, reasoning: string }) => {
    console.log(`File ${filename} successfully uploaded`)
    setShowUploadModal(false)
    
    // Pass the event info to the bank statement upload handler
    handleBankStatementUpload(new File([], filename), eventInfo);
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      >
        <UserOverview
          onAddMember={() => {}}
          onUploadStatement={handleUploadStatement}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
          detectedEventInfo={detectedEventInfo}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`lg:col-span-4 ${isMobileMenuOpen ? "block" : "hidden lg:block"}`}>
            <div className="space-y-6">
              <LifeEventAlerts
                events={lifeEvents}
                onConfirm={handleConfirmEvent}
                onReject={handleRejectEvent}
                onViewDetails={handleViewEventDetails}
                onAddEvent={() => setShowAddEventForm(true)}
                detectedEventInfo={detectedEventInfo}
              />

              <FinancialInsights />
            </div>
          </div>

          <div className="lg:col-span-8">
            {selectedGoals.length > 0 ? (
              <PortfolioRecommendation 
                goals={selectedGoals} 
                event={selectedEvent} 
                apiRecommendations={apiRecommendations}
                isLoading={isLoadingRecommendations}
              />
            ) : (
              <div className="glass-effect shadow-lg rounded-lg p-8 h-full flex flex-col items-center justify-center border border-indigo-900/30 animate-fade-in">
                <div className="w-24 h-24 mb-6 relative">
                  <div className="absolute inset-0 bg-indigo-600/20 rounded-full animate-pulse-slow"></div>
                  <svg
                    className="w-full h-full text-indigo-400 animate-float"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 6V12L16 14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Ready to Plan Your Financial Future?</h3>
                <p className="text-gray-300 text-center max-w-md mb-6">
                  Confirm a life event and select your financial goals to receive personalized investment
                  recommendations.
                </p>
                <button
                  onClick={() => setShowAddEventForm(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg font-medium shadow-lg hover:from-indigo-700 hover:to-blue-600 transition-all duration-300 hover:shadow-indigo-500/30"
                >
                  Add Your First Life Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddEventForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-effect rounded-xl p-6 max-w-md w-full border border-indigo-900/30 shadow-2xl animate-scale max-h-[90vh] overflow-y-auto">
            <AddEventForm onSubmit={handleAddEvent} onCancel={() => setShowAddEventForm(false)} />
          </div>
        </div>
      )}

      {showBankUpload && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-effect rounded-xl max-w-md w-full border border-indigo-900/30 shadow-2xl animate-scale min-h-[450px] h-auto max-h-[80vh] overflow-y-auto">
            <BankStatementUpload 
              onClose={() => setShowBankUpload(false)}
              onSuccess={handleUploadSuccess}
            />
          </div>
        </div>
      )}

      {showEventDetail && selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-effect rounded-xl p-6 max-w-md w-full border border-indigo-900/30 shadow-2xl animate-scale max-h-[90vh] overflow-y-auto">
            <EventDetailModal
              event={selectedEvent}
              onClose={() => setShowEventDetail(false)}
              onConfirm={() => {
                handleConfirmEvent(selectedEvent.id)
                setShowEventDetail(false)
              }}
            />
          </div>
        </div>
      )}

      {showGoalSelection && selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-effect rounded-xl p-6 max-w-lg w-full border border-indigo-900/30 shadow-2xl animate-scale max-h-[90vh] overflow-y-auto">
            <GoalSelectionForm
              event={selectedEvent}
              availableGoals={sampleGoals}
              onSubmit={handleGoalSelection}
              onCancel={() => setShowGoalSelection(false)}
              userId="U123"
              riskProfile={userRiskProfile}
              monthlySurplus={monthlySurplus}
              detectedEventInfo={detectedEventInfo}
            />
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-effect rounded-xl max-w-md w-full border border-indigo-900/30 shadow-2xl animate-scale min-h-[450px] h-auto max-h-[80vh] overflow-y-auto">
            <BankStatementUpload
              onClose={() => setShowUploadModal(false)}
              onSuccess={handleUploadSuccess}
            />
          </div>
        </div>
      )}
    </div>
  )
}

