import { createContext, useState, ReactNode, useEffect } from 'react'
import Cookie from 'js-cookie'
import challenges from '../../challenges.json'
import { LevelUpModal } from '../components/LevelUpModal'

interface Challenge {
  type: 'body' | 'eye';
  description: string;
  amount: number;
}

interface ChallengeContextData {
  level: number;
  currentExperience: number;
  experienceToNextLevel: number;
  challengesCompleted: number;
  activeChallenge: Challenge;
  totalAmount:number;

  levelUp: () => void;
  startNewChallenge: () => void;
  resetChallenge: () => void;
  completeChallenge: () => void;
  closeLevelUpModal: () => void;

}

interface ChallengeProviderProps {
  children: ReactNode;
  level: number;
  totalAmount:number;
  currentExperience: number;
  challengesCompleted: number;

}

export const ChallengeContext = createContext({} as ChallengeContextData)

export function ChallengeProvider ({
  children,
  ...rest
}: ChallengeProviderProps) {
  const [level, setLevel] = useState(rest.level ?? 1)
  const [totalAmount, setTotalAmount] = useState(rest.totalAmount ?? 0)

  const [currentExperience, setCurrentExperience] = useState(
    rest.currentExperience ?? 0
  )
  const [challengesCompleted, setChallengesCompleted] = useState(
    rest.challengesCompleted ?? 0
  )

  const [activeChallenge, setActiveChallenge] = useState(null)
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false)

  const experienceToNextLevel = Math.pow((level + 1) * 4, 2)

  useEffect(() => {
    Notification.requestPermission()
  }, [])

  useEffect(() => {
    Cookie.set('level', String(level))
    Cookie.set('totalAmount', String(totalAmount))
    Cookie.set('currentExperience', String(currentExperience))
    Cookie.set('challengesCompleted', String(challengesCompleted))
  }, [level, currentExperience, challengesCompleted, totalAmount])

  function levelUp () {
    setLevel(level + 1)
    setIsLevelModalOpen(true)
  }

  function closeLevelUpModal () {
    setIsLevelModalOpen(false)
  }

  function startNewChallenge () {
    const randomChallengeIndex = Math.floor(Math.random() * challenges.length)
    const challenge = challenges[randomChallengeIndex]

    setActiveChallenge(challenge)

    new Audio('/notification.mp3').play()

    if (Notification.permission === 'granted') {
      new Notification('Novo Desafio ????', {
        body: `Valendo ${challenge.amount} xp!`
      })
    }
  }

  function resetChallenge () {
    setActiveChallenge(null)
  }

  function completeChallenge () {
    if (!activeChallenge) return
    const { amount } = activeChallenge
    let finalExperience = currentExperience + amount

    if (finalExperience >= experienceToNextLevel) {
      finalExperience = finalExperience - experienceToNextLevel
      levelUp()
    }

    setCurrentExperience(finalExperience)
    setActiveChallenge(null)
    setChallengesCompleted(challengesCompleted + 1)
    setTotalAmount(totalAmount + activeChallenge.amount)
  }

  return (
    <ChallengeContext.Provider
      value={{
        level,
        currentExperience,
        experienceToNextLevel,
        challengesCompleted,
        activeChallenge,
        levelUp,
        startNewChallenge,
        resetChallenge,
        completeChallenge,
        closeLevelUpModal,
        totalAmount

      }}
    >
      {children}

      {isLevelModalOpen && <LevelUpModal />}
    </ChallengeContext.Provider>
  )
}
