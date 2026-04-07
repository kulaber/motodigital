interface Props {
  currentStep: number
  totalSteps: number
  accentColor: string
}

export function OnboardingProgressBar({ currentStep, totalSteps, accentColor }: Props) {
  const pct = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between">
        <span className="text-[10px] uppercase tracking-widest font-medium"
              style={{ color: accentColor }}>
          Schritt {currentStep} von {totalSteps}
        </span>
        <span className="text-[10px] text-white/30">{pct}%</span>
      </div>
      <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: accentColor }}
        />
      </div>
    </div>
  )
}
