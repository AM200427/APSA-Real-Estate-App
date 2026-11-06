// src/hooks/useReduceMotion.js
import { useAppStore } from '../../store/useAppStore';

export const useReduceMotion = () => {
  const reduceMotion = useAppStore((state) => state.preferences?.reduceMotion || false);
  return reduceMotion;
};