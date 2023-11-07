import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { IssueData } from "./IssuesList";
import { IssuePriorityCombobox } from "./IssuePriorityCombobox";
import { Textarea } from "~/components/ui/textarea";

interface DialogProps {
  trigger: string;
  issue: IssueData;
}
 
export function IssueDialog({
  trigger,
  issue
}: DialogProps) {
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
            <Label htmlFor="title" className="text-xl text-right">
              Title
            </Label>
            <Input
              id="title"
              defaultValue={`${issue.title}`}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-xl text-right">
              Description
            </Label>
            <div className="col-span-3">
              <Textarea 
                className="border border-white min-h-[100px]" 
                defaultValue={issue.description}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-xl text-right">
              Priority
            </Label>
            <IssuePriorityCombobox />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}