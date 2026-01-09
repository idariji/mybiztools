import { BusinessCard } from '../types/businesscard';

const STORAGE_KEY = 'business-card-templates';

export const saveTemplate = (card: BusinessCard, templateName: string): void => {
  const templates = getTemplates();
  const template = {
    ...card,
    id: Date.now().toString(),
    name: templateName,
    savedAt: new Date().toISOString()
  };
  templates.push(template);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

export const getTemplates = (): any[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteTemplate = (id: string): void => {
  const templates = getTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

export const loadTemplate = (id: string): BusinessCard | null => {
  const templates = getTemplates();
  return templates.find(t => t.id === id) || null;
};
