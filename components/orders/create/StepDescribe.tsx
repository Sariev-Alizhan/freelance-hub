'use client'
import { motion } from 'framer-motion'
import { Loader2, Wand2, Mic, MicOff } from 'lucide-react'
import { slide, type FormData } from './types'

export default function StepDescribe({
  form, onSet, aiLoading, onGenerateDescription,
  voiceRecording, voiceParsing, onToggleVoice,
}: {
  form: FormData
  onSet: <K extends keyof FormData>(key: K, value: FormData[K]) => void
  aiLoading: boolean
  onGenerateDescription: () => void
  voiceRecording: boolean
  voiceParsing: boolean
  onToggleVoice: () => void
}) {
  return (
    <motion.div key="step1" {...slide} className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold mb-1">Describe the task</h2>
          <p className="text-sm text-muted-foreground">The more detail, the better we match you with a specialist</p>
        </div>
        <button
          type="button"
          onClick={onToggleVoice}
          disabled={voiceParsing}
          title={voiceRecording ? 'Stop recording' : 'Describe by voice'}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          style={{
            background: voiceRecording ? 'rgba(239,68,68,0.1)' : 'var(--fh-primary-muted)',
            border: `1px solid ${voiceRecording ? 'rgba(239,68,68,0.3)' : 'rgba(94,106,210,0.2)'}`,
            color: voiceRecording ? '#ef4444' : '#7170ff',
          }}
        >
          {voiceParsing
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : voiceRecording
              ? <MicOff className="h-4 w-4" />
              : <Mic className="h-4 w-4" />
          }
          {voiceParsing ? 'Parsing…' : voiceRecording ? 'Stop' : 'Voice'}
        </button>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Job title</label>
        <input
          value={form.title}
          onChange={e => onSet('title', e.target.value)}
          placeholder="E.g.: Build an e-commerce store with Next.js"
          maxLength={120}
          className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">Minimum 10 characters</span>
          <span className={`text-xs ${form.title.length >= 10 ? 'text-green-400' : 'text-muted-foreground'}`}>
            {form.title.length}/120
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Description</label>
          <button
            onClick={onGenerateDescription}
            disabled={aiLoading || form.title.trim().length < 10}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {aiLoading
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <Wand2 className="h-3 w-3" />
            }
            AI fill
          </button>
        </div>
        <textarea
          value={form.description}
          onChange={e => onSet('description', e.target.value)}
          placeholder="Describe in detail what needs to be done, what result you expect, any special requirements..."
          rows={6}
          className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">Minimum 30 characters</span>
          <span className={`text-xs ${form.description.length >= 30 ? 'text-green-400' : 'text-muted-foreground'}`}>
            {form.description.length} chars
          </span>
        </div>
      </div>
    </motion.div>
  )
}
