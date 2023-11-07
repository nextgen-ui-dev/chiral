/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

const priorities = [
  {
    value: "urgent",
    label: "⚠️ Urgent",
  },
  {
    value: "high",
    label: "High",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "low",
    label: "Low",
  },
  {
    value: "no_priority",
    label: "No Priority"
  }
]

interface IssuePriorityType {
  defaultVal?: string;
  onChange: (newVal: string) => void;
}

export function IssuePriorityCombobox({
  defaultVal,
  onChange: handlePriority
}: IssuePriorityType) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultVal)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? priorities.find((priority) => priority.value === value)?.label
            : "Select priority..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search priority..." />
          <CommandEmpty>No priority found.</CommandEmpty>
          <CommandGroup>
            {priorities.map((priority) => (
              <CommandItem
                key={priority.value}
                value={priority.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue)
                  handlePriority(currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === priority.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <div
                  className={`text-black ${value === priority.value ? "text-opacity-100" : "text-opacity-70"}`}
                >
                  {priority.label}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
