import { useState } from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { FlightPreviewContent } from "./FlightPreviewContent";

export function FlightDetailDialogTrigger({ flight }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label="航班详情">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-base">航班详情</DialogTitle>
        </DialogHeader>
        <FlightPreviewContent flight={flight} className="pb-2" />
      </DialogContent>
    </Dialog>
  );
}
