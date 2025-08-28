import { useState, useEffect } from "react";

const API_KEY_STORAGE = "gemini_api_key";

export const useAPIKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar API key del localStorage al iniciar
  useEffect(() => {
    try {
      const savedApiKey = localStorage.getItem(API_KEY_STORAGE);
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
    } catch (error) {
      console.error("Error loading API key:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guardar API key
  const saveApiKey = (key: string) => {
    try {
      localStorage.setItem(API_KEY_STORAGE, key);
      setApiKey(key);
    } catch (error) {
      console.error("Error saving API key:", error);
    }
  };

  // Eliminar API key
  const removeApiKey = () => {
    try {
      localStorage.removeItem(API_KEY_STORAGE);
      setApiKey(null);
    } catch (error) {
      console.error("Error removing API key:", error);
    }
  };

  // Verificar si tiene API key
  const hasApiKey = Boolean(apiKey);

  return {
    apiKey,
    hasApiKey,
    isLoading,
    saveApiKey,
    removeApiKey,
  };
};
