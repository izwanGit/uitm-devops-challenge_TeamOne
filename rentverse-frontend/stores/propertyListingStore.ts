import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { uploadProperty, mapPropertyListingToUploadRequest } from '@/utils/propertyUploadApi'

// Define all the form data structure
export interface PropertyListingData {
  // Step 1: Basic Information
  propertyType: string
  propertyTypeId?: string // Store the backend property type ID
  address: string
  city: string
  state: string
  district: string
  subdistrict: string
  streetAddress: string
  houseNumber: string
  zipCode: string
  latitude?: number
  longitude?: number
  autoFillDistance?: number // Distance to closest location in km

  // Step 1: Property Details
  bedrooms: number
  bathrooms: number
  areaSqm: number
  furnished: boolean
  amenities: string[]
  amenityIds: string[] // Store the backend amenity IDs

  // Step 2: Content & Photos
  title: string
  description: string
  images: string[]

  // Step 3: Legal & Pricing
  price: number
  isAvailable: boolean
  legalDocuments: string[]
  maintenanceIncluded: string // 'yes' | 'no' | ''
  landlordType: string // 'individual' | 'company' | 'partnership' | ''
}

export interface PropertyListingStep {
  id: string
  title: string
  component: string
  isCompleted: boolean
  isAccessible: boolean
}

interface PropertyListingStore {
  // State
  currentStep: number
  data: PropertyListingData
  steps: PropertyListingStep[]
  isLoading: boolean
  isDirty: boolean

  // Actions
  setCurrentStep: (step: number) => void
  updateData: (updates: Partial<PropertyListingData>) => void
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: number) => void
  markStepCompleted: (stepIndex: number) => void
  validateCurrentStep: () => boolean
  resetForm: () => void
  clearTemporaryData: () => void
  submitForm: () => Promise<void>
  canAccessStep: (stepIndex: number) => boolean
  loadPropertyData: (property: any) => void
  updateProperty: (id: string) => Promise<void>
}

// Define the steps sequence
const initialSteps: PropertyListingStep[] = [
  {
    id: 'intro',
    title: 'Getting Started',
    component: 'AddListingFirst',
    isCompleted: false,
    isAccessible: true,
  },
  {
    id: 'step-one-intro',
    title: 'Tell us about your place',
    component: 'AddListingStepOne',
    isCompleted: false,
    isAccessible: true, // Make first few steps accessible by default
  },
  {
    id: 'property-type',
    title: 'Property Type',
    component: 'AddListingStepOnePlace',
    isCompleted: false,
    isAccessible: true, // Make this accessible since it's early in the flow
  },
  {
    id: 'location-map',
    title: 'Location & Map',
    component: 'AddListingStepOneMap',
    isCompleted: false,
    isAccessible: false,
  },
  {
    id: 'location-details',
    title: 'Address Details',
    component: 'AddListingStepOneLocation',
    isCompleted: false,
    isAccessible: false,
  },
  {
    id: 'basic-info',
    title: 'Basic Information',
    component: 'AddListingStepOneBasic',
    isCompleted: false,
    isAccessible: false,
  },
  {
    id: 'property-details',
    title: 'Property Details',
    component: 'AddListingStepOneDetails',
    isCompleted: false,
    isAccessible: false,
  },
  {
    id: 'step-two-intro',
    title: 'Make it stand out',
    component: 'AddListingStepTwo',
    isCompleted: false,
    isAccessible: false,
  },
  {
    id: 'photos',
    title: 'Add Photos',
    component: 'AddListingStepTwoPhotos',
    isCompleted: false,
    isAccessible: false,
  },
  {
    id: 'management',
    title: 'Management Settings',
    component: 'AddListingStepTwoManage',
    isCompleted: false,
    isAccessible: false,
  },
  {
    id: 'title',
    title: 'Property Title',
    component: 'AddListingStepTwoTitle',
    isCompleted: false,
    isAccessible: false,
  },
  {
    id: 'description',
    title: 'Description',
    component: 'AddListingStepTwoDescription',
    isCompleted: false,
    isAccessible: false,
  },
  {
    id: 'step-three-intro',
    title: 'Finish and publish',
    component: 'AddListingStepThree',
    isCompleted: false,
    isAccessible: false,
  },
  {
    id: 'legal',
    title: 'Legal Information',
    component: 'AddListingStepThreeLegal',
    isCompleted: false,
    isAccessible: false,
  },
  {
    id: 'pricing',
    title: 'Set Your Price',
    component: 'AddListingStepThreePrice',
    isCompleted: false,
    isAccessible: false,
  },
]

// Initial form data
const initialData: PropertyListingData = {
  propertyType: '',
  address: '',
  city: '',
  state: '',
  district: '',
  subdistrict: '',
  streetAddress: '',
  houseNumber: '',
  zipCode: '',
  latitude: undefined,
  longitude: undefined,
  autoFillDistance: undefined,
  bedrooms: 1,
  bathrooms: 1,
  areaSqm: 0,
  furnished: false,
  amenities: [],
  amenityIds: [],
  title: '',
  description: '',
  images: [],
  price: 0,
  isAvailable: true,
  legalDocuments: [],
  maintenanceIncluded: '',
  landlordType: '',
}

export const usePropertyListingStore = create<PropertyListingStore>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      data: initialData,
      steps: initialSteps,
      isLoading: false,
      isDirty: false,

      setCurrentStep: (step: number) => {
        const { steps } = get()
        if (step >= 0 && step < steps.length && get().canAccessStep(step)) {
          set({ currentStep: step })
        }
      },

      updateData: (updates: Partial<PropertyListingData>) => {
        set((state) => ({
          data: { ...state.data, ...updates },
          isDirty: true,
        }))
      },

      nextStep: () => {
        const { currentStep, steps } = get()
        const nextStep = currentStep + 1

        if (nextStep < steps.length) {
          // Mark current step as completed and make next step accessible
          set((state) => ({
            currentStep: nextStep,
            steps: state.steps.map((step, index) => ({
              ...step,
              isCompleted: index === currentStep ? true : step.isCompleted,
              isAccessible: index === nextStep ? true : step.isAccessible,
            })),
          }))
        }
      },

      previousStep: () => {
        const { currentStep } = get()
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 })
        }
      },

      goToStep: (step: number) => {
        if (get().canAccessStep(step)) {
          set({ currentStep: step })
        }
      },

      markStepCompleted: (stepIndex: number) => {
        set((state) => ({
          steps: state.steps.map((step, index) => ({
            ...step,
            isCompleted: index === stepIndex ? true : step.isCompleted,
            isAccessible: index === stepIndex + 1 ? true : step.isAccessible,
          })),
        }))
      },

      validateCurrentStep: () => {
        const { currentStep, data } = get()
        const currentStepData = get().steps[currentStep]

        console.log('Validating step:', currentStepData.id, 'with data:', data)

        // Add validation logic based on step
        switch (currentStepData.id) {
          case 'property-type': {
            const isValid = !!data.propertyType
            console.log('Property type validation:', isValid, 'propertyType:', data.propertyType)
            return isValid
          }
          case 'location-map':
            return !!(data.latitude && data.longitude)
          case 'location-details': {
            const isValid = !!(data.state && data.district)
            console.log('Location details validation:', {
              isValid,
              state: data.state,
              district: data.district,
              subdistrict: data.subdistrict
            })
            return isValid
          }
          case 'basic-info': {
            const isValid = data.bedrooms > 0 && data.bathrooms > 0 && data.areaSqm > 0
            console.log('Basic info validation:', {
              isValid,
              bedrooms: data.bedrooms,
              bathrooms: data.bathrooms,
              areaSqm: data.areaSqm
            })
            return isValid
          }
          case 'photos': {
            const isValid = data.images.length >= 1
            console.log('Photos validation:', {
              isValid,
              imageCount: data.images.length,
              images: data.images
            })
            return isValid
          }
          case 'title':
            return !!data.title
          case 'description':
            return !!data.description
          case 'legal':
            return !!data.maintenanceIncluded && !!data.landlordType
          case 'pricing':
            return data.price > 0
          default:
            return true // For intro steps and steps without validation
        }
      },

      canAccessStep: (stepIndex: number) => {
        const { steps } = get()
        if (stepIndex >= steps.length || stepIndex < 0) return false

        // First step is always accessible
        if (stepIndex === 0) return true

        // Check if step is marked as accessible
        return steps[stepIndex].isAccessible
      },

      resetForm: () => {
        set({
          currentStep: 0,
          data: initialData,
          steps: initialSteps,
          isDirty: false,
        })
      },

      clearTemporaryData: () => {
        // Clear from localStorage
        localStorage.removeItem('property-listing-storage')
        get().resetForm()
      },

      submitForm: async () => {
        set({ isLoading: true })
        try {
          const { data } = get()

          // Validate required fields including propertyTypeId
          if (!data.propertyType) {
            throw new Error('Property type is required')
          }

          if (!data.propertyTypeId) {
            console.warn('No propertyTypeId found, using fallback mapping')
          }

          // Log images status
          if (data.images && data.images.length > 0) {
            console.log(`Property has ${data.images.length} images ready for upload:`, data.images)
          } else {
            console.warn('No images found in property data - property will be created without images')
          }

          // Check multiple ways to get auth token
          let token = null

          // Try localStorage
          if (typeof window !== 'undefined') {
            token = localStorage.getItem('authToken')
          }

          // If no token, check if it's in a different format or location
          if (!token && typeof window !== 'undefined') {
            // Check for alternative token storage
            const authData = localStorage.getItem('auth-storage')
            if (authData) {
              try {
                const parsed = JSON.parse(authData)
                token = parsed.state?.token || parsed.token
              } catch {
                // Silent fail for parsing errors
              }
            }
          }

          if (!token) {
            // Redirect to login page instead of throwing an error
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login'
            }
            return
          }

          // Map property data to upload format (now includes dynamic propertyTypeId)
          const uploadData = mapPropertyListingToUploadRequest(data)

          console.log('Submitting property with propertyTypeId:', uploadData.propertyTypeId)

          // Upload property to backend
          await uploadProperty(uploadData, token)

          // Clear temporary data after successful submission
          get().clearTemporaryData()

        } catch (error) {
          console.error('Error submitting property listing:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      loadPropertyData: (property: any) => {
        // Map backend property to store data format
        const mappedData: PropertyListingData = {
          propertyType: property.propertyType?.name?.toLowerCase() || property.type?.toLowerCase() || '',
          propertyTypeId: property.propertyTypeId || property.propertyType?.id,
          address: property.address || '',
          city: property.city || '',
          state: property.state || '',
          district: property.district || '',
          subdistrict: '',
          streetAddress: property.address || '', // Duplicate address here if street address not separate
          houseNumber: '',
          zipCode: property.zipCode || '',
          latitude: property.latitude,
          longitude: property.longitude,
          autoFillDistance: undefined,
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          areaSqm: property.areaSqm || 0,
          furnished: property.furnished || false,
          amenities: property.amenities?.map((a: any) => a.name || a) || [],
          amenityIds: property.amenityIds || property.amenities?.map((a: any) => a.id).filter(Boolean) || [],
          title: property.title || '',
          description: property.description || '',
          images: property.images || [],
          price: typeof property.price === 'string' ? parseFloat(property.price) : property.price || 0,
          isAvailable: property.isAvailable ?? true,
          legalDocuments: [],
          maintenanceIncluded: 'no',
          landlordType: 'individual',
        }

        const { steps } = get()

        // Mark all steps as accessible and mostly completed for editing
        const updatedSteps = steps.map(step => ({
          ...step,
          isAccessible: true,
          isCompleted: true
        }))

        set({
          data: mappedData,
          currentStep: 0, // Start at intro or step 1
          steps: updatedSteps,
          isDirty: false
        })
      },

      updateProperty: async (id: string) => {
        set({ isLoading: true })
        try {
          const { data } = get()
          let token = null
          if (typeof window !== 'undefined') {
            token = localStorage.getItem('authToken')
          }

          if (!token) throw new Error('Authentication required')

          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

          // Map data for update - similar to upload but might be slightly different structure
          // Reuse mapPropertyListingToUploadRequest for now as it matches backend DTO usually
          const updateData = mapPropertyListingToUploadRequest(data)

          const res = await fetch(`${API_URL}/api/properties/${id}`, {
            method: 'PUT', // or PATCH
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
          })

          if (!res.ok) {
            const error = await res.json()
            throw new Error(error.message || 'Failed to update property')
          }

          get().clearTemporaryData()

        } catch (error) {
          console.error('Error updating property:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'property-listing-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        data: state.data,
        steps: state.steps,
        isDirty: state.isDirty,
      }),
    }
  )
)

export default usePropertyListingStore