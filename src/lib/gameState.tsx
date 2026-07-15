'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface GameState {
  xp: number;
  level: number;
  gold: number;
  streak: number;
  solvedIds: number[];
  avatar: string;
  title: string;
  unlockedTitles: string[];
  unlockedAchievements: string[];
  petName: string;
  petAccessories: string[];
  activeAccessories: string[];
  theme: string;
  userName: string;
  profilePicture: string;
  addXp: (amount: number) => void;
  addGold: (amount: number) => void;
  solveProblem: (id: number, difficulty: 'Easy' | 'Medium' | 'Hard') => void;
  toggleProblemCompletion: (problemId: number) => void;
  updateAvatar: (avatar: string) => void;
  updateTitle: (title: string) => void;
  buyAccessory: (accessory: string, cost: number) => boolean;
  toggleAccessory: (accessory: string) => void;
  updateTheme: (theme: string) => void;
  toggleTheme: () => void;
  updateUserName: (name: string) => void;
  updateProfilePicture: (dataUrl: string) => void;
  incrementStreak: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameState | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'codenode_game_state_v1';

export const getXpForNextLevel = (lvl: number) => lvl * 200;

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [gold, setGold] = useState(0);
  const [streak, setStreak] = useState(0);
  const [solvedIds, setSolvedIds] = useState<number[]>([]);
  const [avatar, setAvatar] = useState('sherlock');
  const [title, setTitle] = useState('Bug Rookie');
  const [unlockedTitles, setUnlockedTitles] = useState<string[]>(['Bug Rookie']);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [petName, setPetName] = useState('Byte');
  const [petAccessories, setPetAccessories] = useState<string[]>([]);
  const [activeAccessories, setActiveAccessories] = useState<string[]>([]);
  const [theme, setTheme] = useState('theme-dark');
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.xp !== undefined) setXp(parsed.xp);
        if (parsed.level !== undefined) setLevel(parsed.level);
        if (parsed.gold !== undefined) setGold(parsed.gold);
        if (parsed.streak !== undefined) setStreak(parsed.streak);
        if (parsed.solvedIds !== undefined) setSolvedIds(parsed.solvedIds);
        if (parsed.title !== undefined) setTitle(parsed.title);
        if (parsed.unlockedTitles !== undefined) setUnlockedTitles(parsed.unlockedTitles);
        if (parsed.unlockedAchievements !== undefined) setUnlockedAchievements(parsed.unlockedAchievements);
        if (parsed.petName !== undefined) setPetName(parsed.petName);
        if (parsed.petAccessories !== undefined) setPetAccessories(parsed.petAccessories);
        if (parsed.activeAccessories !== undefined) setActiveAccessories(parsed.activeAccessories);
        if (parsed.userName !== undefined) setUserName(parsed.userName);
        if (parsed.profilePicture !== undefined) setProfilePicture(parsed.profilePicture);
        
        // Sanitize theme to prevent loading old deleted theme keys
        const validThemes = ['theme-light', 'theme-dark'];
        if (parsed.theme !== undefined) {
          if (validThemes.includes(parsed.theme)) {
            setTheme(parsed.theme);
          } else {
            setTheme('theme-dark');
          }
        }

        // Sanitize avatar to prevent loading old deleted animal avatars
        const validAvatars = ['sherlock', 'neo', 'yoda', 'stark'];
        if (parsed.avatar !== undefined) {
          if (validAvatars.includes(parsed.avatar)) {
            setAvatar(parsed.avatar);
          } else {
            setAvatar('sherlock');
          }
        }
      } catch (err) {
        console.error('Error loading gamified state:', err);
      }
    } else {
      // Default to dark mode when there is no saved preference
      setTheme('theme-dark');
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    const stateToSave = {
      xp,
      level,
      gold,
      streak,
      solvedIds,
      avatar,
      title,
      unlockedTitles,
      unlockedAchievements,
      petName,
      petAccessories,
      activeAccessories,
      theme,
      userName,
      profilePicture,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    localStorage.setItem('leetcode_solved_ids', JSON.stringify(solvedIds)); // Keep in sync with existing code
  }, [xp, level, gold, streak, solvedIds, avatar, title, unlockedTitles, unlockedAchievements, petName, petAccessories, activeAccessories, theme, userName, isLoaded]);

  const addXp = (amount: number) => {
    setXp((prevXp) => {
      let currentXp = prevXp + amount;
      let currentLvl = level;
      let leveledUp = false;
      const newTitles = [...unlockedTitles];
      const newAchievements = [...unlockedAchievements];

      while (currentXp >= getXpForNextLevel(currentLvl)) {
        currentXp -= getXpForNextLevel(currentLvl);
        currentLvl += 1;
        leveledUp = true;

        // Unlock titles based on level
        if (currentLvl === 3 && !newTitles.includes('Semicolon Survivor')) {
          newTitles.push('Semicolon Survivor');
        }
        if (currentLvl === 5 && !newTitles.includes('Callback Crusader')) {
          newTitles.push('Callback Crusader');
        }
        if (currentLvl === 8 && !newTitles.includes('O(1) Sorcerer')) {
          newTitles.push('O(1) Sorcerer');
        }
        if (currentLvl === 12 && !newTitles.includes('Kernel Conqueror')) {
          newTitles.push('Kernel Conqueror');
        }
      }

      if (leveledUp) {
        setLevel(currentLvl);
        setUnlockedTitles(newTitles);
        
        // Level achievement
        if (currentLvl >= 5 && !newAchievements.includes('High Level Coder')) {
          newAchievements.push('High Level Coder');
          setUnlockedAchievements(newAchievements);
        }
        
        // Show playful notification in console or custom trigger
        console.log(`🎉 Level Up! You are now level ${currentLvl}!`);
      }

      return currentXp;
    });
  };

  const addGold = (amount: number) => {
    setGold((prev) => prev + amount);
  };

  const solveProblem = (id: number, difficulty: 'Easy' | 'Medium' | 'Hard') => {
    setSolvedIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      
      // Compute XP and Gold awards
      const xpReward = difficulty === 'Easy' ? 100 : difficulty === 'Medium' ? 200 : 400;
      const goldReward = difficulty === 'Easy' ? 15 : difficulty === 'Medium' ? 30 : 60;
      
      setTimeout(() => {
        addXp(xpReward);
        addGold(goldReward);
      }, 50);

      // Achievements triggers
      const newAchievements = [...unlockedAchievements];
      if (updated.length === 1 && !newAchievements.includes('First Semicolon')) {
        newAchievements.push('First Semicolon');
      }
      if (updated.length >= 5 && !newAchievements.includes('Code Crusader')) {
        newAchievements.push('Code Crusader');
      }
      if (difficulty === 'Hard' && !newAchievements.includes('Dragon Slayer')) {
        newAchievements.push('Dragon Slayer');
      }
      if (newAchievements.length !== unlockedAchievements.length) {
        setUnlockedAchievements(newAchievements);
      }

      return updated;
    });
  };
  
  const toggleProblemCompletion = (problemId: number) => {
    let updatedSolvedIds: number[];

    if (solvedIds.includes(problemId)) {
      // If already solved, the user is unchecking it -> remove it
      updatedSolvedIds = solvedIds.filter(id => id !== problemId);
    } else {
      // If not solved, the user is checking it or submitting code -> add it
      updatedSolvedIds = [...solvedIds, problemId];
    }

    setSolvedIds(updatedSolvedIds);

    // Dynamically recalculate streak / XP based on the new array length
    const totalSolved = updatedSolvedIds.length;
    const calculatedXp = totalSolved * 25; // Example: 25 XP per problem
    const nextStreak = totalSolved > 0 ? (streak === 0 ? 1 : streak) : 0;

    setXp(calculatedXp);
    setStreak(nextStreak);
    
    // Also update achievements if checking
    if (updatedSolvedIds.length > 0) {
      const newAchievements = [...unlockedAchievements];
      if (!newAchievements.includes('First Semicolon')) {
        newAchievements.push('First Semicolon');
        setUnlockedAchievements(newAchievements);
      }
    }
  };

  const updateAvatar = (newAvatar: string) => {
    setAvatar(newAvatar);
  };

  const updateTitle = (newTitle: string) => {
    if (unlockedTitles.includes(newTitle)) {
      setTitle(newTitle);
    }
  };

  const buyAccessory = (accessory: string, cost: number) => {
    if (gold >= cost && !petAccessories.includes(accessory)) {
      setGold((prev) => prev - cost);
      setPetAccessories((prev) => [...prev, accessory]);
      setActiveAccessories((prev) => [...prev, accessory]);
      
      const newAchievements = [...unlockedAchievements];
      if (!newAchievements.includes('Pet Stylist')) {
        newAchievements.push('Pet Stylist');
        setUnlockedAchievements(newAchievements);
      }
      return true;
    }
    return false;
  };

  const toggleAccessory = (accessory: string) => {
    setActiveAccessories((prev) => {
      if (prev.includes(accessory)) {
        return prev.filter((a) => a !== accessory);
      } else {
        return [...prev, accessory];
      }
    });
  };

  const updateTheme = (newTheme: string) => {
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'theme-light' ? 'theme-dark' : 'theme-light'));
  };

  const updateUserName = (name: string) => {
    setUserName(name);
  };

  const updateProfilePicture = (dataUrl: string) => {
    setProfilePicture(dataUrl);
  };

  const incrementStreak = () => {
    setStreak((prev) => {
      const next = prev + 1;
      if (next >= 7 && !unlockedAchievements.includes('Streak Legend')) {
        setUnlockedAchievements((a) => [...a, 'Streak Legend']);
      }
      return next;
    });
  };

  const resetGame = () => {
    setXp(0);
    setLevel(1);
    setGold(0);
    setStreak(1);
    setSolvedIds([]);
    setAvatar('sherlock');
    setTitle('Bug Rookie');
    setUnlockedTitles(['Bug Rookie']);
    setUnlockedAchievements([]);
    setPetAccessories([]);
    setActiveAccessories([]);
    setTheme('theme-dark');
    setUserName('');
    setProfilePicture('');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <GameContext.Provider
      value={{
        xp,
        level,
        gold,
        streak,
        solvedIds,
        avatar,
        title,
        unlockedTitles,
        unlockedAchievements,
        petName,
        petAccessories,
        activeAccessories,
        theme,
        userName,
        profilePicture,
        addXp,
        addGold,
        solveProblem,
        toggleProblemCompletion,
        updateAvatar,
        updateTitle,
        buyAccessory,
        toggleAccessory,
        updateTheme,
        toggleTheme,
        updateUserName,
        updateProfilePicture,
        incrementStreak,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
}
