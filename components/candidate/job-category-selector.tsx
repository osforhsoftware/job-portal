"use client"

import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export interface JobCategory {
  id: string
  name: string
  emoji: string
  description: string
}

const jobCategories: JobCategory[] = [
  { id: "construction", name: "Construction", emoji: "👷", description: "Construction workers, laborers" },
  { id: "driver", name: "Driver", emoji: "🚚", description: "Taxi, truck, delivery drivers" },
  { id: "cook", name: "Cook", emoji: "🍳", description: "Chefs, kitchen staff" },
  { id: "cleaner", name: "Cleaner", emoji: "🧹", description: "Housekeeping, janitorial" },
  { id: "office", name: "Office Staff", emoji: "🖥️", description: "Admin, clerical, reception" },
  { id: "security", name: "Security", emoji: "🛡️", description: "Guards, security officers" },
  { id: "retail", name: "Retail", emoji: "🛒", description: "Sales, cashiers, store staff" },
  { id: "healthcare", name: "Healthcare", emoji: "🏥", description: "Nurses, caregivers, medical" },
  { id: "hospitality", name: "Hospitality", emoji: "🏨", description: "Hotel, restaurant staff" },
  { id: "beauty", name: "Beauty & Salon", emoji: "💇", description: "Hair stylists, beauticians" },
  { id: "delivery", name: "Delivery", emoji: "📦", description: "Delivery personnel" },
  { id: "maintenance", name: "Maintenance", emoji: "🔧", description: "Technicians, repairmen" },
]

interface JobCategorySelectorProps {
  selectedCategories: string[]
  onSelectionChange: (categories: string[]) => void
  required?: boolean
}

export function JobCategorySelector({
  selectedCategories,
  onSelectionChange,
  required = false,
}: JobCategorySelectorProps) {
  const handleToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onSelectionChange(selectedCategories.filter(id => id !== categoryId))
    } else {
      onSelectionChange([...selectedCategories, categoryId])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">
          Select Your Job Category {required && "*"}
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Choose one or more categories that match your skills
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {jobCategories.map((category) => {
          const isSelected = selectedCategories.includes(category.id)
          return (
            <Card
              key={category.id}
              className={`cursor-pointer border-2 transition-all hover:border-primary ${
                isSelected ? "border-primary bg-primary/5" : "border-border"
              }`}
              onClick={() => handleToggle(category.id)}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(category.id)}
                    className="pointer-events-none"
                  />
                  <div className="flex-1 text-center">
                    <div className="text-3xl mb-1">{category.emoji}</div>
                    <div className="text-sm font-medium text-foreground">
                      {category.name}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {selectedCategories.length > 0 && (
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-sm font-medium text-foreground mb-1">
            Selected: {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((id) => {
              const category = jobCategories.find(c => c.id === id)
              return category ? (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                >
                  <span>{category.emoji}</span>
                  <span>{category.name}</span>
                </span>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
