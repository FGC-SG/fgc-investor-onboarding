import React from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useOnboarding, STEP_LABELS } from '../../context/OnboardingContext'
import clsx from 'clsx'

interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  loading?: boolean
  hideBack?: boolean
}

export function StepLayout({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  loading,
  hideBack,
}: Props) {
  const { goBack, isFirstStep, applicableSteps, currentStepId, currentStepIndex, totalSteps } = useOnboarding()

  // Build progress steps (exclude 'confirmation')
  const progressSteps = applicableSteps.filter(s => s !== 'confirmation')
  const progressIndex = progressSteps.findIndex(s => s === currentStepId)

  return (
    <div className="min-h-screen bg-fgc-bg flex flex-col">
      {/* Header */}
      <header className="bg-fgc-navy text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-fgc-gold flex items-center justify-center">
              <span className="text-fgc-navy font-bold text-sm">FGC</span>
            </div>
            <div>
              <p className="text-xs text-blue-200 uppercase tracking-widest">Felicity Global Capital Pte. Ltd.</p>
              <p className="text-sm font-semibold">Investor Onboarding Portal</p>
            </div>
          </div>
          <div className="text-right text-xs text-blue-200">
            <p>Confidential</p>
            <p>Regulated by MAS</p>
          </div>
        </div>

        {/* Step progress bar */}
        {currentStepId !== 'welcome' && currentStepId !== 'confirmation' && (
          <div className="bg-fgc-blue/50 border-t border-blue-700/30">
            <div className="max-w-5xl mx-auto px-6 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-200">
                  Step {progressIndex + 1} of {progressSteps.length}
                </span>
                <span className="text-xs text-blue-200">
                  {Math.round(((progressIndex + 1) / progressSteps.length) * 100)}% complete
                </span>
              </div>
              <div className="h-1.5 bg-blue-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-fgc-gold rounded-full transition-all duration-500"
                  style={{ width: `${((progressIndex + 1) / progressSteps.length) * 100}%` }}
                />
              </div>
              {/* Step pills — only show nearby steps */}
              <div className="mt-2 flex items-center gap-1 overflow-x-auto scrollbar-none">
                {progressSteps.map((step, i) => (
                  <div
                    key={step}
                    className={clsx(
                      'flex-shrink-0 text-xs px-2 py-0.5 rounded-full transition-colors',
                      i === progressIndex
                        ? 'bg-fgc-gold text-fgc-navy font-semibold'
                        : i < progressIndex
                        ? 'bg-blue-700/60 text-blue-100'
                        : 'bg-blue-900/40 text-blue-400'
                    )}
                  >
                    {STEP_LABELS[step]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-fgc-navy">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>

        <div className="space-y-6">{children}</div>
      </main>

      {/* Footer nav */}
      {currentStepId !== 'confirmation' && (
        <footer className="sticky bottom-0 bg-white border-t border-gray-200 shadow-up">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack ?? goBack}
              disabled={isFirstStep || hideBack}
              className={clsx(
                'btn-ghost',
                (isFirstStep || hideBack) && 'invisible'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <p className="text-xs text-gray-400">
              All information is treated strictly confidential under the PDPA
            </p>

            <button
              type="button"
              onClick={onNext}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {nextLabel}
              {!loading && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}
