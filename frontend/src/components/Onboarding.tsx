import { useStore } from '../store'
import { t, getLang } from '../i18n'

export default function Onboarding() {
  const completeOnboardingAndStart = useStore(s => s.completeOnboardingAndStart)

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-illustration">
          <span className="ob-creature">🐱</span>
          <span className="ob-creature ob-creature--2">🦄</span>
          <span className="ob-creature ob-creature--3">🐲</span>
          <div className="ob-sparkles">✨✨✨</div>
        </div>
        <h1 className="ob-title">{t('onboard_welcome')}</h1>
        <p className="ob-desc">{t('onboard_desc')}</p>

        <div className="ob-steps">
          <div className="ob-step">
            <span className="ob-step-num">1</span>
            <span>{getLang() === 'ru' ? 'Нажми на зверька, чтобы выбрать' : 'Tap a creature to select it'}</span>
          </div>
          <div className="ob-step">
            <span className="ob-step-num">2</span>
            <span>{getLang() === 'ru' ? 'Нажми на такого же, чтобы слить' : 'Tap another of the same kind to merge'}</span>
          </div>
          <div className="ob-step">
            <span className="ob-step-num">3</span>
            <span>{getLang() === 'ru' ? 'Нажми на !, чтобы собрать ресурсы' : 'Tap ! bubble to collect resources'}</span>
          </div>
        </div>

        <button className="btn btn--primary btn--xl" onClick={completeOnboardingAndStart}>
          {t('onboard_start')}
        </button>
      </div>
    </div>
  )
}
