import React, { createContext, useContext, useState, useCallback } from 'react'
import type { OnboardingData, StepId } from '../types'

const ALL_STEPS: StepId[] = [
  'welcome',
  'identity',
  'mas_classification',
  'japan_qualification',
  'entity_people',
  'beneficial_ownership',
  'aml_kyc',
  'crs_fatca',
  'tax_offences',
  'risk_profile',
  'documents',
  'declarations',
  'review',
  'confirmation',
]

function getApplicableSteps(data: OnboardingData): StepId[] {
  const isIndividual = data.investorType === 'individual'
  const isJapan = data.jurisdiction === 'FSA' || data.jurisdiction === 'BOTH'
  const isMAS = data.jurisdiction === 'MAS' || data.jurisdiction === 'BOTH'
  const isEntity = !isIndividual

  const steps: StepId[] = ['welcome', 'identity']

  if (isMAS) steps.push('mas_classification')
  if (isJapan) steps.push('japan_qualification')
  if (isEntity) {
    steps.push('entity_people')
    steps.push('beneficial_ownership')
  }
  steps.push('aml_kyc')
  steps.push('crs_fatca')
  steps.push('tax_offences')
  steps.push('risk_profile')
  steps.push('documents')
  steps.push('declarations')
  steps.push('review')
  steps.push('confirmation')

  return steps
}

interface OnboardingContextValue {
  data: OnboardingData
  currentStepId: StepId
  applicableSteps: StepId[]
  currentStepIndex: number
  totalSteps: number
  isFirstStep: boolean
  isLastContentStep: boolean
  updateData: (patch: Partial<OnboardingData>) => void
  goNext: () => void
  goBack: () => void
  goToStep: (id: StepId) => void
  resetOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

const INITIAL_DATA: OnboardingData = {
  jurisdiction: 'MAS',
  investorType: 'individual',
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA)
  const [currentStepId, setCurrentStepId] = useState<StepId>('welcome')

  const applicableSteps = getApplicableSteps(data)
  const currentStepIndex = applicableSteps.indexOf(currentStepId)
  const totalSteps = applicableSteps.filter(s => s !== 'confirmation').length

  const updateData = useCallback((patch: Partial<OnboardingData>) => {
    setData(prev => {
      const next = { ...prev, ...patch }
      // Recompute step list when jurisdiction or investorType changes
      if ('jurisdiction' in patch || 'investorType' in patch) {
        const newSteps = getApplicableSteps(next)
        if (!newSteps.includes(currentStepId)) {
          setCurrentStepId(newSteps[0])
        }
      }
      return next
    })
  }, [currentStepId])

  const goNext = useCallback(() => {
    const steps = getApplicableSteps(data)
    const idx = steps.indexOf(currentStepId)
    if (idx < steps.length - 1) setCurrentStepId(steps[idx + 1])
  }, [data, currentStepId])

  const goBack = useCallback(() => {
    const steps = getApplicableSteps(data)
    const idx = steps.indexOf(currentStepId)
    if (idx > 0) setCurrentStepId(steps[idx - 1])
  }, [data, currentStepId])

  const goToStep = useCallback((id: StepId) => {
    setCurrentStepId(id)
  }, [])

  const resetOnboarding = useCallback(() => {
    setData(INITIAL_DATA)
    setCurrentStepId('welcome')
  }, [])

  return (
    <OnboardingContext.Provider value={{
      data,
      currentStepId,
      applicableSteps,
      currentStepIndex,
      totalSteps,
      isFirstStep: currentStepIndex === 0,
      isLastContentStep: currentStepId === 'review',
      updateData,
      goNext,
      goBack,
      goToStep,
      resetOnboarding,
    }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}

// Human-readable step labels
export const STEP_LABELS: Record<StepId, string> = {
  welcome: 'Investor Type',
  identity: 'Identity & Contact',
  mas_classification: 'MAS Classification',
  japan_qualification: 'Japan FSA Qualification',
  entity_people: 'Directors & Officers',
  beneficial_ownership: 'Beneficial Ownership',
  aml_kyc: 'AML / KYC Details',
  crs_fatca: 'CRS & FATCA',
  tax_offences: 'Tax Offences',
  risk_profile: 'Risk Profile',
  documents: 'Document Checklist',
  declarations: 'Declarations',
  review: 'Review & Submit',
  confirmation: 'Confirmation',
}

export { ALL_STEPS }
