'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import NavBarTop from '@/components/NavBarTop'
import NavbarStepperBottom from '@/components/NavbarStepperBottom'
import ProgressTracker from '@/components/ProgressTracker'
import { usePropertyListingStore } from '@/stores/propertyListingStore'
import useAuthStore from '@/stores/authStore'

interface EnhancedQuestionnaireWrapperProps {
  children: React.ReactNode
  showProgressTracker?: boolean
  onFinishOverride?: () => Promise<void>
}

function EnhancedQuestionnaireWrapper({
  children,
  showProgressTracker = false,
  onFinishOverride
}: EnhancedQuestionnaireWrapperProps) {
  const router = useRouter()
  const {
    currentStep,
    steps,
    nextStep,
    previousStep,
    validateCurrentStep,
    submitForm,
  } = usePropertyListingStore()

  const { isLoggedIn } = useAuthStore()

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const totalSteps = steps.length

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        handleFinish()
      } else {
        nextStep()
      }
    } else {
      // Show validation error or highlight required fields
      console.warn('Please complete all required fields before proceeding')
      // You could add a toast notification here for better UX
      alert('Please complete all required fields before proceeding to the next step.')
    }
  }

  const handleBack = () => {
    previousStep()
  }

  const handleFinish = async () => {
    // Use custom override if provided (e.g. for Edit Property)
    if (onFinishOverride) {
      await onFinishOverride()
      return
    }

    // Check if user is logged in before submitting
    if (!isLoggedIn) {
      // Redirect to login page
      router.push('/auth/login')
      return
    }

    try {
      await submitForm()
      router.push('/property/success') // Redirect to success page
    } catch (error) {
      console.error('Failed to submit property listing:', error)
      // Handle error (show toast, etc.)
    }
  }

  return (
    <>
      <NavBarTop isQuestionnaire={true} />

      <div className="mx-auto w-full max-w-7xl min-h-screen flex pt-20 pb-32">
        {/* Progress Tracker Sidebar */}
        {showProgressTracker && (
          <div className="hidden lg:block w-80 p-6 flex-shrink-0">
            <div className="sticky top-24">
              <ProgressTracker />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 flex items-start justify-center ${showProgressTracker ? 'pl-6' : ''}`}>
          <div className="w-full max-w-6xl">
            {children}
          </div>
        </div>
      </div>

      <NavbarStepperBottom
        level={Math.ceil((currentStep + 1) / (totalSteps / 3))}
        progress={progressPercentage}
        isLastStep={isLastStep}
        isBackHidden={isFirstStep}
        onBack={handleBack}
        onNext={handleNext}
        onFinish={handleFinish}
      />
    </>
  )
}

export default EnhancedQuestionnaireWrapper