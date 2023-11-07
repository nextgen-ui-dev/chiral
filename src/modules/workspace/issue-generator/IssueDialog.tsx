import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { IssueData } from "./IssuesList";
import { IssuePriorityCombobox } from "./IssuePriorityCombobox";
import { Textarea } from "~/components/ui/textarea";
import React, { useState } from "react";

interface DialogProps {
  trigger: string;
  issue: IssueData;
  changed: () => void;
}
 
export function IssueDialog({
  trigger,
  issue,
  changed
}: DialogProps) {
  const [title, setTitle] = useState<string>(issue.title);
  const [description, setDescription] = useState<string>(issue.description);
  const [priority, setPriority] = useState<string>(issue.priority);

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    issue.title = e.target.value;
    changed();
  }

  const handleDesc = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    issue.description = e.target.value;
    changed();
  }

  const handlePriority = (newVal: string) => {
    setPriority(newVal);
    issue.priority = newVal;
    changed();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          {trigger}
          {/* Edit Profile */}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            See Details
            {/* Edit profile */}
          </DialogTitle>
          <DialogDescription className="text-gray-200">
            {"You can view and edit the issue's detail here"}
            {/* Make changes to your profile here. Click save when you're done. */}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-xl text-right" 
            >
              Title
            </Label>
            <Input
              id="title"
              defaultValue={`${title}`}
              className="col-span-3"
              onChange={handleTitle}
              />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-xl text-right"
            >
              Description
            </Label>
            <div className="col-span-3">
              <Textarea 
                className="border border-white min-h-[100px]" 
                onChange={handleDesc}
                defaultValue={description}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-xl text-right"
            >
              Priority
            </Label>
            <IssuePriorityCombobox 
              defaultVal={priority}
              onChange={handlePriority}
            />
          </div>
        </div>
        <DialogClose>
          <Button 
            type="submit"
          >Save changes</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}