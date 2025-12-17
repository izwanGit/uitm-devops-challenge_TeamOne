'use client'

import { useEffect } from 'react'
import { usePropertyListingStore } from '@/stores/propertyListingStore'
import EnhancedQuestionnaireWrapper from '@/components/EnhancedQuestionnaireWrapper'

// Import all the step components
import AddListingFirst from '@/views/AddListingFirst'
import AddListingStepOne from '@/views/AddListingStepOne'
import AddListingStepOnePlace from '@/views/AddListingStepOnePlace'
import AddListingStepOneMap from '@/views/AddListingStepOneMap'
import AddListingStepOneLocation from '@/views/AddListingStepOneLocation'
import AddListingStepOneBasic from '@/views/AddListingStepOneBasic'
import AddListingStepOneDetails from '@/views/AddListingStepOneDetails'
import AddListingStepTwo from '@/views/AddListingStepTwo'
import AddListingStepTwoPhotos from '@/views/AddListingStepTwoPhotos'
import AddListingStepTwoManage from '@/views/AddListingStepTwoManage'
import AddListingStepTwoTitle from '@/views/AddListingStepTwoTitle'
import AddListingStepTwoDescription from '@/views/AddListingStepTwoDescription'
import AddListingStepThree from '@/views/AddListingStepThree'
import AddListingStepThreeLegal from '@/views/AddListingStepThreeLegal'
import AddListingStepThreePrice from '@/views/AddListingStepThreePrice'

// Component mapping
const componentMap = {
  AddListingFirst,
  AddListingStepOne,
  AddListingStepOnePlace,
  AddListingStepOneMap,
  AddListingStepOneLocation,
  AddListingStepOneBasic,
  AddListingStepOneDetails,
  AddListingStepTwo,
  AddListingStepTwoPhotos,
  AddListingStepTwoManage,
  AddListingStepTwoTitle,
  AddListingStepTwoDescription,
  AddListingStepThree,
  AddListingStepThreeLegal,
  AddListingStepThreePrice,
}

function NewPropertyPage() {
  const { currentStep, steps, resetForm } = usePropertyListingStore()

  // Reset form when component mounts (fresh page load)
  useEffect(() => {
    resetForm()
  }, []) // Empty dependency array = runs once on mount

  // Get the current step configuration
  const currentStepConfig = steps[currentStep]

  // Get the component to render
  const ComponentToRender = componentMap[currentStepConfig.component as keyof typeof componentMap]

  // Determine if we should show the progress tracker
  // Show it from step 2 onwards (after the intro)
  const showProgressTracker = currentStep > 0

  if (!ComponentToRender) {
    return (
      <EnhancedQuestionnaireWrapper showProgressTracker={showProgressTracker}>
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Component not found
          </h2>
          <p className="text-slate-600">
            The requested step component could not be loaded.
          </p>
        </div>
      </EnhancedQuestionnaireWrapper>
    )
  }

  return (
    <EnhancedQuestionnaireWrapper showProgressTracker={showProgressTracker}>
      <ComponentToRender />
    </EnhancedQuestionnaireWrapper>
  )
}

export default NewPropertyPage
