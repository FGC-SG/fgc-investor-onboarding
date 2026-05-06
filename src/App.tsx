import React from 'react'
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext'
import { WelcomeStep } from './components/steps/WelcomeStep'
import { IdentityStep } from './components/steps/IdentityStep'
import { MASClassificationStep } from './components/steps/MASClassificationStep'
import { JapanQualificationStep } from './components/steps/JapanQualificationStep'
import { EntityPeopleStep } from './components/steps/EntityPeopleStep'
import { BeneficialOwnershipStep } from './components/steps/BeneficialOwnershipStep'
import { AMLKYCStep, TaxOffencesStep } from './components/steps/AMLKYCStep'
import { CRSFATCAStep } from './components/steps/CRSFATCAStep'
import { RiskProfileStep } from './components/steps/RiskProfileStep'
import { DocumentsStep } from './components/steps/DocumentsStep'
import { DeclarationsStep } from './components/steps/DeclarationsStep'
import { ReviewStep } from './components/steps/ReviewStep'
import { ConfirmationStep } from './components/steps/ConfirmationStep'

function OnboardingRouter() {
  const { currentStepId } = useOnboarding()

  switch (currentStepId) {
    case 'welcome':           return <WelcomeStep />
    case 'identity':          return <IdentityStep />
    case 'mas_classification': return <MASClassificationStep />
    case 'japan_qualification': return <JapanQualificationStep />
    case 'entity_people':     return <EntityPeopleStep />
    case 'beneficial_ownership': return <BeneficialOwnershipStep />
    case 'aml_kyc':           return <AMLKYCStep />
    case 'tax_offences':      return <TaxOffencesStep />
    case 'crs_fatca':         return <CRSFATCAStep />
    case 'risk_profile':      return <RiskProfileStep />
    case 'documents':         return <DocumentsStep />
    case 'declarations':      return <DeclarationsStep />
    case 'review':            return <ReviewStep />
    case 'confirmation':      return <ConfirmationStep />
    default:                  return <WelcomeStep />
  }
}

export default function App() {
  return (
    <OnboardingProvider>
      <OnboardingRouter />
    </OnboardingProvider>
  )
}
