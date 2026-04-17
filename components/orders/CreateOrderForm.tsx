'use client'
import { AnimatePresence } from 'framer-motion'
import { useUser } from '@/lib/hooks/useUser'
import { useCreateOrder } from '@/lib/hooks/useCreateOrder'
import StepProgress from './create/StepProgress'
import StepCategory from './create/StepCategory'
import StepDescribe from './create/StepDescribe'
import StepDetails from './create/StepDetails'
import StepReview from './create/StepReview'
import StepSuccess from './create/StepSuccess'
import CreateOrderNav from './create/CreateOrderNav'

export default function CreateOrderForm() {
  const { user } = useUser()
  const {
    form, set, step, setStep,
    submitting, aiLoading,
    skillInput, setSkillInput, addSkill, removeSkill,
    priceAdvice, priceAdviceLoading, getPriceAdvice, applyPriceAdvice,
    voiceRecording, voiceParsing, toggleVoice,
    generateDescription, handleSubmit,
    createdOrderId, canNext,
  } = useCreateOrder(user)

  return (
    <div className="rounded-2xl border border-subtle bg-card overflow-hidden">
      {step < 4 && <StepProgress step={step} />}

      <div className="p-6">
        <AnimatePresence mode="wait">
          {step === 0 && <StepCategory form={form} onSet={set} />}
          {step === 1 && (
            <StepDescribe
              form={form} onSet={set}
              aiLoading={aiLoading}
              onGenerateDescription={generateDescription}
              voiceRecording={voiceRecording}
              voiceParsing={voiceParsing}
              onToggleVoice={toggleVoice}
            />
          )}
          {step === 2 && (
            <StepDetails
              form={form} onSet={set}
              skillInput={skillInput}
              onSkillInputChange={setSkillInput}
              onAddSkill={addSkill}
              onRemoveSkill={removeSkill}
              priceAdvice={priceAdvice}
              priceAdviceLoading={priceAdviceLoading}
              onGetPriceAdvice={getPriceAdvice}
              onApplyPriceAdvice={applyPriceAdvice}
            />
          )}
          {step === 3 && <StepReview form={form} user={user} />}
          {step === 4 && <StepSuccess orderId={createdOrderId} />}
        </AnimatePresence>
      </div>

      {step < 4 && (
        <CreateOrderNav
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
