
'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Command as CommandPrimitive } from 'cmdk';

const multiSelectVariants = cva(
  'm-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300',
  {
    variants: {
      variant: {
        default:
          'border-foreground/10 text-foreground bg-card hover:bg-card/80',
        secondary:
          'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        inverted: 'inverted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface MultiSelectProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof multiSelectVariants> {
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  asChild?: boolean;
  className?: string;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = 'Select options',
      animation,
      maxCount,
      asChild,
      className,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(defaultValue);
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      onValueChange(selectedValues);
    }, [selectedValues, onValueChange]);

    const handleSelect = (value: string) => {
      if (selectedValues.includes(value)) {
        setSelectedValues(selectedValues.filter((v) => v !== value));
      } else {
        if (maxCount && selectedValues.length >= maxCount) {
          return;
        }
        setSelectedValues([...selectedValues, value]);
      }
    };

    const handleRemove = (value: string) => {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    };

    const handleFocus = () => {
        setIsFocused(true);
        inputRef.current?.focus();
    };

    return (
      <Command
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !inputRef.current?.value) {
            e.preventDefault();
            const lastSelectedValue = selectedValues[selectedValues.length - 1];
            if (lastSelectedValue) {
              handleRemove(lastSelectedValue);
            }
          }
        }}
        className='overflow-visible bg-transparent'
      >
        <div
          className={cn(
            'group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            className
          )}
          onClick={handleFocus}
        >
          <div className='flex flex-wrap gap-1'>
            {selectedValues.map((value) => {
              const option = options.find((o) => o.value === value);
              return (
                <Badge
                  key={value}
                  className={cn(multiSelectVariants({ variant }))}
                  {...props}
                >
                  {option?.label}
                  <button
                    className='ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRemove(value);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleRemove(value)}
                  >
                    <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                  </button>
                </Badge>
              );
            })}
            <CommandPrimitive.Input
              ref={inputRef}
              placeholder={placeholder}
              className='ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground'
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>
        </div>
        <div className='relative mt-2'>
          {isFocused && (
            <CommandList className='absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in'>
              <CommandGroup className='h-full overflow-auto'>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => handleSelect(option.value)}
                    className={cn(
                      'cursor-pointer',
                      selectedValues.includes(option.value) && 'font-bold'
                    )}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          )}
        </div>
      </Command>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';
