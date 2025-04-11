import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ModelSelector, { AIModel } from "./ModelSelector";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ChatSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  settings: {
    streamResponses: boolean;
    enhancedContext: boolean;
    preventRepetition: boolean;
  };
  onSettingsChange: (key: string, value: boolean) => void;
}

// AI Models from our FastAPI backend
const AI_MODELS: AIModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description:
      "OpenAI's most advanced multimodal model, capable of handling text, image, and audio inputs with exceptional reasoning abilities.",
    capabilities: [
      "Multimodal understanding (text, images)",
      "Advanced reasoning and problem solving",
      "Complex code generation and analysis",
      "Detailed explanations with visual context",
    ],
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description:
      "A fast, efficient model for everyday tasks like drafting emails, answering questions, and generating ideas.",
    capabilities: [
      "Quick response generation",
      "Cost-effective for high volume tasks",
      "Good balance of performance and efficiency",
      "Suitable for most general-purpose applications",
    ],
  },
  {
    id: "claude-3-7-sonnet-20250219",
    name: "Claude 3.7 Sonnet",
    description:
      "Anthropic's newest model with exceptional reasoning capabilities, known for thoughtful and nuanced responses.",
    capabilities: [
      "Nuanced understanding of complex topics",
      "High accuracy and low hallucination rate",
      "Strong ethical reasoning",
      "Effective for creative writing and analysis",
    ],
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    description:
      "Anthropic's most capable model, designed for complex tasks requiring deep understanding and reasoning.",
    capabilities: [
      "Superior reasoning and problem-solving",
      "Advanced knowledge understanding",
      "Nuanced text generation",
      "Complex instruction following",
    ],
  },
  {
    id: "llama-3.1-8b-instant",
    name: "llama-3.1-8b-instant",
    description:
      "Meta's 18B parameter LLaMA 3 model, optimized for speed and high-quality responses in real-time applications.",
    capabilities: [
      "Fast and efficient text generation",
      "Strong reasoning and language understanding",
      "Context-aware responses",
      "Optimized for low-latency deployment",
    ],
  },
];

export default function ChatSettings({
  open,
  onOpenChange,
  selectedModel,
  onSelectModel,
  settings,
  onSettingsChange,
}: ChatSettingsProps) {
  const handleToggleSetting = (key: string) => (checked: boolean) => {
    onSettingsChange(key, checked);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark text-white border-dark-lightest sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure AI model and behavior preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <ModelSelector
            models={AI_MODELS}
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
          />

          <Separator className="bg-dark-lightest" />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Response Settings</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="stream-responses">Stream responses</Label>
                <p className="text-xs text-gray-400">
                  Get AI responses word by word as they're generated
                </p>
              </div>
              <Switch
                id="stream-responses"
                checked={settings.streamResponses}
                onCheckedChange={handleToggleSetting("streamResponses")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enhanced-context">Enhanced context</Label>
                <p className="text-xs text-gray-400">
                  Include more context from previous messages
                </p>
              </div>
              <Switch
                id="enhanced-context"
                checked={settings.enhancedContext}
                onCheckedChange={handleToggleSetting("enhancedContext")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="prevent-repetition">Prevent repetition</Label>
                <p className="text-xs text-gray-400">
                  Reduce repetitive responses from the AI
                </p>
              </div>
              <Switch
                id="prevent-repetition"
                checked={settings.preventRepetition}
                onCheckedChange={handleToggleSetting("preventRepetition")}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between border-t border-dark-lightest pt-4">
          <Button
            variant="outline"
            onClick={() => {
              // Reset to defaults with GPT-4o as the default model
              onSelectModel("gpt-4o");
              onSettingsChange("streamResponses", true);
              onSettingsChange("enhancedContext", true);
              onSettingsChange("preventRepetition", true);
            }}
            className="bg-dark-lighter border-dark-lightest text-gray-300 hover:bg-dark-lightest"
          >
            Reset to defaults
          </Button>
          <DialogClose asChild>
            <Button className="bg-primary hover:bg-primary-light text-white">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
