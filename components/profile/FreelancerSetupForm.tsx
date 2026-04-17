'use client'
import { AnimatePresence } from 'framer-motion'
import { useUser } from '@/lib/hooks/useUser'
import { useFreelancerSetup } from '@/lib/hooks/useFreelancerSetup'
import StepProgress from './setup/StepProgress'
import StepPersonal from './setup/StepPersonal'
import StepSpecialization from './setup/StepSpecialization'
import StepSkills from './setup/StepSkills'
import StepPortfolio from './setup/StepPortfolio'
import StepReview from './setup/StepReview'
import StepSuccess from './setup/StepSuccess'
import SetupNav from './setup/SetupNav'

export default function FreelancerSetupForm() {
  const { user } = useUser()
  const {
    form, set, step, setStep,
    submitting, submitError, aiLoading,
    skillInput, setSkillInput,
    addSkill, toggleLanguage, generateBio, handleSubmit,
    canNext,
  } = useFreelancerSetup(user)

  return (
    <div className="rounded-2xl border border-subtle bg-card overflow-hidden">
      {step < 5 && <StepProgress step={step} />}

      <div className="p-6">
        <AnimatePresence mode="wait">
          {step === 0 && <StepPersonal form={form} onSet={set} />}
          {step === 1 && (
            <StepSpecialization
              form={form} onSet={set}
              onToggleLanguage={toggleLanguage}
              onGenerateBio={generateBio}
              aiLoading={aiLoading}
            />
          )}
          {step === 2 && (
            <StepSkills
              form={form} onSet={set}
              skillInput={skillInput}
              onSkillInputChange={setSkillInput}
              onAddSkill={addSkill}
            />
          )}
          {step === 3 && <StepPortfolio form={form} onSet={set} />}
          {step === 4 && <StepReview form={form} user={user} submitError={submitError} />}
          {step === 5 && <StepSuccess />}
        </AnimatePresence>
      </div>

      {step < 5 && (
        <SetupNav
          step={step}
          canNext={canNext}
          submitting={submitting}
          onStep={setStep}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
