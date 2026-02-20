import { useStore } from '../store'
import { t, formatDate, getLang } from '../i18n'
import { CREATURE_FAMILIES, FAMILIES_ORDER, getCreatureDef, MAX_LEVEL } from '../gameData'
import type { CreatureFamily } from '../types'

export default function CollectionScreen() {
  const discoveredCreatures = useStore(s => s.gameState.discoveredCreatures)
  const lang = getLang()

  const total = FAMILIES_ORDER.length * MAX_LEVEL
  const found = discoveredCreatures.length

  return (
    <div className="screen-container">
      <h2 className="screen-title">{t('collection_title')}</h2>
      <p className="collection-count">{t('collection_discovered', { count: `${found}/${total}` })}</p>

      {FAMILIES_ORDER.map(family => (
        <FamilySection
          key={family}
          family={family}
          discovered={discoveredCreatures}
          lang={lang}
        />
      ))}
    </div>
  )
}

// ─── Family section ───────────────────────────────────────────────────────────
interface FamilySectionProps {
  family: CreatureFamily
  discovered: { family: CreatureFamily; level: number; discoveredAt: number; totalMerged: number }[]
  lang: string
}

function FamilySection({ family, discovered, lang }: FamilySectionProps) {
  const familyDef = CREATURE_FAMILIES[family]
  const familyName = lang === 'ru'
    ? familyDef.levels[0].nameRu.split(' ').slice(1).join(' ') || familyDef.levels[0].nameRu
    : familyDef.levels[0].nameEn.split(' ').slice(1).join(' ') || familyDef.levels[0].nameEn

  return (
    <div className="family-section">
      <h3 className="family-title">
        {familyDef.levels[0].emoji} {lang === 'ru' ? getFamilyNameRu(family) : getFamilyNameEn(family)}
      </h3>
      <div className="collection-row">
        {familyDef.levels.map(lvlDef => {
          const entry = discovered.find(d => d.family === family && d.level === lvlDef.level)
          const isDiscovered = !!entry

          return (
            <div
              key={lvlDef.level}
              className={`collection-card ${isDiscovered ? 'collection-card--found' : 'collection-card--locked'}`}
              style={isDiscovered ? { '--glow': lvlDef.glowColor, '--bg': lvlDef.color } as React.CSSProperties : {}}
            >
              {isDiscovered ? (
                <>
                  <span className="cc-emoji">{lvlDef.emoji}</span>
                  <span className="cc-level">Lv.{lvlDef.level}</span>
                  <span className="cc-name">{lang === 'ru' ? lvlDef.nameRu : lvlDef.nameEn}</span>
                  {entry.totalMerged > 0 && (
                    <span className="cc-merged">{t('collection_total_merged', { count: entry.totalMerged })}</span>
                  )}
                </>
              ) : (
                <>
                  <span className="cc-emoji cc-emoji--locked">❓</span>
                  <span className="cc-level">Lv.{lvlDef.level}</span>
                  <span className="cc-name cc-name--locked">{t('collection_locked')}</span>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getFamilyNameEn(family: CreatureFamily): string {
  const names: Record<CreatureFamily, string> = {
    fairy_cat: 'Fairy Cats',
    baby_dragon: 'Baby Dragons',
    mini_unicorn: 'Mini Unicorns',
    forest_fox: 'Forest Foxes',
    mushroom_sprite: 'Mushroom Sprites',
  }
  return names[family]
}

function getFamilyNameRu(family: CreatureFamily): string {
  const names: Record<CreatureFamily, string> = {
    fairy_cat: 'Волшебные Кошки',
    baby_dragon: 'Малютки-Драконы',
    mini_unicorn: 'Мини-Единороги',
    forest_fox: 'Лесные Лисы',
    mushroom_sprite: 'Грибные Эльфы',
  }
  return names[family]
}
