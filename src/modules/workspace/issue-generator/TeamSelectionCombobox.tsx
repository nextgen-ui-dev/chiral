/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { api } from "~/utils/api"
import { Team } from "@linear/sdk"

export function TeamSelectionCombobox({
  handleSelectTeam
}: { handleSelectTeam?: (id: string) => void }) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  
  const { data: teams, isLoading: teamIsLoading } = 
    api.workspace.linear.getTeams.useQuery(undefined, {
      refetchOnWindowFocus: false
    });

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
            ? teams?.find((team) => team.id === value)?.name
            : "Select team..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search team..." />
          <CommandEmpty>No team found.</CommandEmpty>
          <CommandGroup>
            {teams?.map((team) => (
              <CommandItem
                key={team.id}
                value={team.id}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  handleSelectTeam && handleSelectTeam(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === team.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div
                  className={`text-black ${value === team.id ? "text-opacity-100" : "text-opacity-70"}`}
                >
                  {team.name}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
