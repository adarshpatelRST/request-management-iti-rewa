import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../i18n/LanguageContext";

export interface ComboboxItem {
  id: string;
  label: string;
  subLabel?: string;
  badgeText?: string;
}

export interface DropSearchProps {
  items?: ComboboxItem[];
  options?: ComboboxItem[];
  value: string | null;
  onChange?: (value: string | null) => void;
  onSelect?: (value: any) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  allOption?: { id: string; label: string };
  width?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
  className?: string;
}

export const DropSearch: React.FC<DropSearchProps> = ({
  items,
  options,
  value,
  onChange,
  onSelect,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No matching items found.",
  allOption,
  width = "w-[280px]",
  disabled = false,
  align = "start",
  className,
}) => {
  const { language } = useLanguage();

  const displayPlaceholder =
    placeholder === "Select an option..."
      ? (language === "hi" ? "चयन करें..." : placeholder)
      : placeholder;

  const displaySearchPlaceholder =
    searchPlaceholder === "Search..."
      ? (language === "hi" ? "खोजें..." : searchPlaceholder)
      : searchPlaceholder;

  const displayEmptyMessage =
    emptyMessage === "No matching items found."
      ? (language === "hi" ? "कोई मेल खाता विकल्प नहीं मिला।" : emptyMessage)
      : emptyMessage;
  const effectiveItems = React.useMemo(() => {
    const raw = items ?? options ?? [];
    if (!allOption) return raw;
    return raw.filter(
      (item) =>
        item.id !== allOption.id &&
        item.label.trim().toLowerCase() !== allOption.label.trim().toLowerCase(),
    );
  }, [items, options, allOption]);

  const effectiveChange = onChange ?? onSelect ?? (() => {});

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredItems = React.useMemo(() => {
    if (!search.trim()) return effectiveItems;
    const q = search.trim().toLowerCase();
    return effectiveItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.subLabel && item.subLabel.toLowerCase().includes(q)) ||
        item.id.toLowerCase().includes(q),
    );
  }, [effectiveItems, search]);

  const selectedLabel = React.useMemo(() => {
    if (allOption && (value === null || value === allOption.id)) {
      return allOption.label;
    }
    const found = effectiveItems.find((item) => item.id === value);
    return found ? found.label : null;
  }, [effectiveItems, value, allOption]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "justify-between font-normal text-left h-10 bg-white border border-slate-300 text-slate-900 shadow-2xs hover:bg-slate-50 hover:border-slate-400 text-xs font-sans px-3 transition-colors",
            width,
            !selectedLabel && "text-slate-400",
            className,
          )}
        >
          <span className="truncate">{selectedLabel || displayPlaceholder}</span>
          <ChevronsUpDown
            className="ml-2 h-4 w-4 size-4 shrink-0 text-slate-400"
            aria-hidden="true"
          />
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          sideOffset={4}
          avoidCollisions={true}
          collisionPadding={16}
          className={cn(
            "z-50 rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            width === "w-full" ? "w-[var(--radix-popover-trigger-width)]" : width,
          )}
        >
          <Command shouldFilter={false} className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-white text-slate-900">
            <div
              className="flex items-center border-b border-slate-200 px-3 bg-white"
              cmdk-input-wrapper=""
            >
              <Search
                className="mr-2 h-4 w-4 size-4 shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder={displaySearchPlaceholder}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-400 text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Command.List className="max-h-[280px] overflow-y-auto overflow-x-hidden p-1.5 bg-white divide-y divide-slate-50">
              {filteredItems.length === 0 && (
                <Command.Empty className="py-6 text-center text-xs text-slate-500">
                  {displayEmptyMessage}
                </Command.Empty>
              )}
              <Command.Group>
                {allOption && (
                  <Command.Item
                    value={allOption.label}
                    onSelect={() => {
                      effectiveChange(null);
                      handleOpenChange(false);
                    }}
                    className="relative flex cursor-pointer select-none items-center rounded-lg px-2.5 py-2 text-sm outline-none hover:bg-slate-100 aria-selected:bg-indigo-50 aria-selected:text-[#1e3a8a] transition-colors"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 size-4 shrink-0 text-[#1e3a8a]",
                        value === null || value === allOption.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span className="font-semibold text-slate-900">{allOption.label}</span>
                  </Command.Item>
                )}
                {filteredItems.map((item) => {
                  const isSelected = value === item.id;
                  return (
                    <Command.Item
                      key={item.id}
                      value={item.id}
                      onSelect={() => {
                        effectiveChange(item.id);
                        handleOpenChange(false);
                      }}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center justify-between rounded-lg px-2.5 py-2 text-sm outline-none transition-colors",
                        isSelected
                          ? "bg-indigo-50/80 text-[#1e3a8a]"
                          : "hover:bg-slate-100 text-slate-900 aria-selected:bg-slate-100",
                      )}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 size-4 shrink-0 text-[#1e3a8a]",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <div className="min-w-0 flex-1 text-left py-0.5">
                          <div
                            className={cn(
                              "font-medium leading-snug whitespace-normal break-words",
                              isSelected ? "font-bold text-[#1e3a8a]" : "text-slate-900",
                            )}
                          >
                            {item.label}
                          </div>
                          {item.subLabel && (
                            <div className="text-xs text-slate-500 leading-tight mt-0.5 whitespace-normal break-words">
                              {item.subLabel}
                            </div>
                          )}
                        </div>
                      </div>
                      {item.badgeText && (
                        <span className="ml-2 rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600 shrink-0">
                          {item.badgeText}
                        </span>
                      )}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            </Command.List>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
