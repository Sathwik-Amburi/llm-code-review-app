"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface QuestionFormProps {
  formData: {
    vulnerability: string
    exploitability: string
    compilationStatus: string
    suitableForTraining: string
    notes: string
  }
  onChange: (field: string, value: string) => void
}

export default function QuestionForm({ formData, onChange }: QuestionFormProps) {
  // Helper to determine if a field is required
  const isRequired = (field: keyof typeof formData) => {
    return ["vulnerability", "exploitability"].includes(field)
  }

  // Helper to check if a required field is empty
  const isEmpty = (field: keyof typeof formData) => {
    return isRequired(field) && !formData[field]
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">
          Vulnerability Assessment
          <span className="text-destructive ml-1">*</span>
        </h3>
        <div className={isEmpty("vulnerability") ? "border-l-2 border-destructive pl-2" : ""}>
          <RadioGroup
            value={formData.vulnerability}
            onValueChange={(value) => onChange("vulnerability", value)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="vulnerability-high" />
              <Label htmlFor="vulnerability-high">High</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="vulnerability-medium" />
              <Label htmlFor="vulnerability-medium">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="vulnerability-low" />
              <Label htmlFor="vulnerability-low">Low</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="vulnerability-none" />
              <Label htmlFor="vulnerability-none">None</Label>
            </div>
          </RadioGroup>
          {isEmpty("vulnerability") && (
            <p className="text-xs text-destructive mt-1">Please select a vulnerability level</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">
          Exploitability
          <span className="text-destructive ml-1">*</span>
        </h3>
        <div className={isEmpty("exploitability") ? "border-l-2 border-destructive pl-2" : ""}>
          <RadioGroup
            value={formData.exploitability}
            onValueChange={(value) => onChange("exploitability", value)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="easy" id="exploitability-easy" />
              <Label htmlFor="exploitability-easy">Easy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="exploitability-moderate" />
              <Label htmlFor="exploitability-moderate">Moderate</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="difficult" id="exploitability-difficult" />
              <Label htmlFor="exploitability-difficult">Difficult</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not-exploitable" id="exploitability-not-exploitable" />
              <Label htmlFor="exploitability-not-exploitable">Not Exploitable</Label>
            </div>
          </RadioGroup>
          {isEmpty("exploitability") && (
            <p className="text-xs text-destructive mt-1">Please select an exploitability level</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Compilation Status</h3>
        <div>
          <RadioGroup
            value={formData.compilationStatus}
            onValueChange={(value) => onChange("compilationStatus", value)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compiles" id="compilation-compiles" />
              <Label htmlFor="compilation-compiles">Compiles</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="does-not-compile" id="compilation-does-not-compile" />
              <Label htmlFor="compilation-does-not-compile">Does Not Compile</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unknown" id="compilation-unknown" />
              <Label htmlFor="compilation-unknown">Unknown</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Suitable for Security Training</h3>
        <div>
          <RadioGroup
            value={formData.suitableForTraining}
            onValueChange={(value) => onChange("suitableForTraining", value)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="training-yes" />
              <Label htmlFor="training-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="training-no" />
              <Label htmlFor="training-no">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="with-modifications" id="training-with-modifications" />
              <Label htmlFor="training-with-modifications">With modifications</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Additional Notes</h3>
        <Textarea
          placeholder="Enter any additional observations or comments about the code..."
          value={formData.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Include details about vulnerabilities found, potential fixes, or why this code is suitable for training.
        </p>
      </div>
    </div>
  )
}

