import { useEffect, useState } from 'react'
import { getAvailableSports } from '../services/userConfig.js'

export default function SportsTabs({ activeSport, setSport, userSettings }) {
  const [availableSports, setAvailableSports] = useState(['all'])

  useEffect(() => {
    async function loadAvailableSports() {
      // Si les paramètres utilisateur sont fournis directement, les utiliser
      if (userSettings) {
        const sports = await getAvailableSports(userSettings)
        setAvailableSports(sports)
      } else {
        // Sinon charger depuis le service
        const sports = await getAvailableSports()
        setAvailableSports(sports)
      }
    }
    loadAvailableSports()
  }, [userSettings])

  // Labels pour les sports
  const sportLabels = {
    f1: 'F1',
    football: 'Football',
    rugby: 'Rugby',
    basketball: 'Basket',
    tennis: 'Tennis',
  }

  // Construction dynamique des onglets
  const tabs = [
    { id: 'all', label: 'Tous' },
    { id: 'teams', label: 'Équipes' },
    ...availableSports
      .filter((sport) => sport !== 'all') // Éviter la duplication de "all"
      .map((sport) => ({
        id: sport,
        label:
          sportLabels[sport] || sport.charAt(0).toUpperCase() + sport.slice(1),
      })),
  ]

  return (
    <nav
      className="tabs flex items-center justify-center gap-2 px-3.5 py-[0.65rem] mx-4 my-3 rounded-2xl overflow-x-auto overflow-y-hidden"
      role="tablist"
      aria-label="Sports"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          className="tab whitespace-nowrap max-[767px]:flex-none max-[767px]:min-h-[44px] max-[767px]:px-3.5 max-[767px]:py-2 max-[767px]:text-[13px]"
          aria-selected={activeSport === tab.id}
          onClick={() => setSport(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
