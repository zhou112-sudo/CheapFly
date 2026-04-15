import { useEffect, useId, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  cityPickerHeadline,
  filterPickerCities,
  formatAirportPickerName,
  getLocationItemById,
  locationPillLabel,
} from "@/data/locations";
import { cn } from "@/lib/utils";

function HighlightMatch({ text, query }) {
  const q = query.trim().toLowerCase();
  if (!q) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-muted px-0.5 font-medium text-foreground dark:bg-muted dark:text-foreground">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export function LocationPickerCommand({
  id: idProp,
  label,
  value,
  onChange,
  placeholder = "城市或机场",
  className,
  triggerClassName,
}) {
  const reactId = useId();
  const btnId = idProp ?? `loc-pick-${reactId}`;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = filterPickerCities(search);
  const display = value ? locationPillLabel(value) : placeholder;

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <Label htmlFor={btnId} className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={btnId}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-12 justify-between rounded-xl border-border/90 bg-background px-3 text-left text-sm font-normal shadow-sm hover:bg-background/80",
              !value && "text-muted-foreground",
              triggerClassName
            )}
          >
            <span className="truncate font-medium">{display}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(calc(100vw-2rem),420px)] p-0 shadow-xl" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="城市、机场或三字码" value={search} onValueChange={setSearch} />
            <CommandList>
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">无结果</div>
              ) : (
                filtered.map((city) => (
                  <div key={city.id} className="border-b border-border/50 last:border-0">
                    <CommandItem
                      value={`city:${city.id}`}
                      className="my-1 rounded-lg font-semibold text-foreground aria-selected:bg-accent"
                      onPointerDown={(e) => e.preventDefault()}
                      onSelect={() => {
                        const item = getLocationItemById(`city:${city.id}`);
                        if (item) onChange(item);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          value?.id === `city:${city.id}` ? "opacity-100" : "opacity-0"
                        )}
                        aria-hidden
                      />
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="leading-snug">
                          <HighlightMatch text={cityPickerHeadline(city)} query={search} />
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">城市 · 所有机场</span>
                      </span>
                    </CommandItem>
                    {city.airports.map((ap) => {
                      const line = formatAirportPickerName(city, ap);
                      const apId = `ap:${ap.code}`;
                      return (
                        <CommandItem
                          key={apId}
                          value={apId}
                          className="mb-1 ml-2 rounded-lg border-l-2 border-border/60 pl-5 text-[13px] aria-selected:bg-accent"
                          onPointerDown={(e) => e.preventDefault()}
                          onSelect={() => {
                            const item = getLocationItemById(apId);
                            if (item) onChange(item);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              value?.id === apId ? "opacity-100" : "opacity-0"
                            )}
                            aria-hidden
                          />
                          <HighlightMatch text={line} query={search} />
                        </CommandItem>
                      );
                    })}
                  </div>
                ))
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
