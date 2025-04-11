import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface AIModel {
  id: string;
  name: string;
  description: string;
  capabilities?: string[];
}

interface ModelSelectorProps {
  models: AIModel[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export default function ModelSelector({
  models,
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) {
  const handleModelChange = (value: string) => {
    onSelectModel(value);
  };

  // Find the selected model
  const currentModel = models.find((model) => model.id === selectedModel);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="model-select">AI Model</Label>
        <Select value={selectedModel} onValueChange={handleModelChange}>
          <SelectTrigger
            id="model-select"
            className="w-full bg-dark-lightests border-x-dark-lightest"
          >
            <SelectValue placeholder="Select an AI model" />
          </SelectTrigger>
          <SelectContent className="bg-dark-lighter border-dark-lightest">
            {models.map((model) => (
              <SelectItem
                key={model.id}
                value={model.id}
                className="text-white hover:bg-dark-lightest hover:text-primary focus:bg-dark-lightest focus:text-primary"
              >
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentModel && (
        <div className="rounded-md bg-dark-lightest p-3 text-sm space-y-2">
          <p className="font-medium">{currentModel.name}</p>
          <p className="text-gray-400">{currentModel.description}</p>
          {currentModel.capabilities &&
            currentModel.capabilities.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-xs text-gray-300 mb-1">
                  Capabilities:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-400">
                  {currentModel.capabilities.map((capability, index) => (
                    <li key={index}>{capability}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
