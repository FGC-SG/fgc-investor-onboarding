import React from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import { CheckCircle2, Download, Mail, RotateCcw } from 'lucide-react'

export function ConfirmationStep() {
  const { data, resetOnboarding } = useOnboarding()
  const isIndividual = data.investorType === 'individual'
  const name = isIndividual
    ? data.individual?.fullName
    : (data.entity as any)?.legalName

  return (
    <div className="min-h-screen bg-fgc-bg flex flex-col">
      {/* Header */}
      <header className="bg-fgc-navy text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-fgc-gold flex items-center justify-center">
            <span className="text-fgc-navy font-bold text-sm">FGC</span>
          </div>
          <div>
            <p className="text-xs text-blue-200 uppercase tracking-widest">Felicity Global Capital Pte. Ltd.</p>
            <p className="text-sm font-semibold">Investor Onboarding Portal</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <div className="card p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-fgc-navy mb-2">Application Submitted</h1>
          <p className="text-gray-500 mb-6">
            Thank you{name ? `, ${name}` : ''}. Your investor onboarding application has been successfully submitted to Felicity Global Capital Pte. Ltd.
          </p>

          <div className="bg-fgc-navy/5 rounded-lg px-6 py-4 inline-block mb-8">
            <p className="text-xs text-gray-500 mb-1">Your Reference Number</p>
            <p className="text-2xl font-bold text-fgc-navy tracking-widest">{data.referenceNo}</p>
            <p className="text-xs text-gray-400 mt-1">{data.submittedAt ? new Date(data.submittedAt).toLocaleString() : ''}</p>
          </div>

          <div className="text-left space-y-4 mb-8">
            <h2 className="text-sm font-semibold text-fgc-navy">What happens next?</h2>
            <div className="space-y-3">
              {[
                {
                  step: '1',
                  title: 'Document Verification',
                  desc: 'FGC Compliance will review your submitted documents and information. You may be contacted for additional documentation or clarification.',
                },
                {
                  step: '2',
                  title: 'AML/KYC Screening',
                  desc: 'Your information will be screened against World-Check, MAS watchlist, OFAC, and other relevant databases.',
                },
                {
                  step: '3',
                  title: 'Investor Classification Review',
                  desc: 'FGC will verify your Accredited Investor / Institutional Investor status based on the documents provided.',
                },
                {
                  step: '4',
                  title: 'Approval & Onboarding',
                  desc: 'Upon successful completion of all checks, you will be notified and provided with further instructions regarding your investment.',
                },
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-fgc-blue text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-fgc-navy">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-800 text-left mb-8">
            <strong>Please send your original documents to:</strong>
            <div className="mt-2">
              <p>Felicity Global Capital Pte. Ltd.</p>
              <p>6 Temasek Boulevard, #29-04, Suntec Tower Four</p>
              <p>Singapore 038986</p>
              <p className="mt-1">Attention: Mr. Calvin Chia</p>
              <p>Email: <a href="mailto:chia@fgcsg.com" className="underline">chia@fgcsg.com</a></p>
            </div>
            <p className="mt-2">
              Where this Agreement is submitted by email, the original signed Agreement must also be sent to FGC at the above address.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button type="button" className="btn-primary">
              <Download className="w-4 h-4" />
              Download Summary PDF
            </button>
            <button type="button" className="btn-secondary">
              <Mail className="w-4 h-4" />
              Email Summary to Myself
            </button>
            <button type="button" className="btn-ghost" onClick={resetOnboarding}>
              <RotateCcw className="w-4 h-4" />
              Submit Another Application
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-fgc-navy text-blue-200 text-xs text-center py-4">
        <p>© {new Date().getFullYear()} Felicity Global Capital Pte. Ltd. · 6 Temasek Boulevard, #29-04 Suntec Tower Four, Singapore 038986</p>
        <p className="mt-1">Capital Markets Services Licence · Regulated by the Monetary Authority of Singapore</p>
      </footer>
    </div>
  )
}
