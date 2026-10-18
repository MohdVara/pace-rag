import type { ComponentType } from "react";
export interface AssistantProps {
  scopeId?: "professional" | "implementation" | "fictional";
  libraryExternal?: boolean;
  presentation?: "lab" | "portfolio";
  starterQuestions?: readonly string[];
  onPublicationReady?: (ready: boolean) => void;
  corpusId?: "portfolio" | "lab";
  assetBase?: string;
  onClose?: () => void;
  lab?: boolean;
  live?: { apiBase: string; turnstileSiteKey: string; verified?: true };
}
declare const Assistant: ComponentType<AssistantProps>;
export default Assistant;
