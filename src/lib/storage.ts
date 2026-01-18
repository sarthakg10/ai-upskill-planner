// Client-side localStorage utilities with safe guards

import { UpskillInputs, UpskillPlan } from './types';

const INPUTS_KEY = 'ai-upskill-inputs';
const PLAN_KEY = 'ai-upskill-plan';

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function saveInputs(inputs: UpskillInputs): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available');
    return;
  }
  try {
    localStorage.setItem(INPUTS_KEY, JSON.stringify(inputs));
  } catch (error) {
    console.error('Failed to save inputs:', error);
  }
}

export function loadInputs(): UpskillInputs | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  try {
    const data = localStorage.getItem(INPUTS_KEY);
    if (!data) return null;
    return JSON.parse(data) as UpskillInputs;
  } catch (error) {
    console.error('Failed to load inputs:', error);
    return null;
  }
}

export function savePlan(plan: UpskillPlan): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available');
    return;
  }
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  } catch (error) {
    console.error('Failed to save plan:', error);
  }
}

export function loadPlan(): UpskillPlan | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  try {
    const data = localStorage.getItem(PLAN_KEY);
    if (!data) return null;
    return JSON.parse(data) as UpskillPlan;
  } catch (error) {
    console.error('Failed to load plan:', error);
    return null;
  }
}
