import { Plus } from "lucide-react"
import type { FieldType } from "@/types/api"
import { FIELD_TYPE_GROUPS, FIELD_TYPE_META } from "@/features/forms/fieldTypeMeta"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export function AddFieldMenu({ onAdd }: { onAdd: (type: FieldType) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="w-full sm:w-auto"><Plus className="h-4 w-4" /> Add field</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 max-h-96 overflow-y-auto p-2">
        {FIELD_TYPE_GROUPS.map((group) => (
          <div key={group} className="mb-1">
            <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-base-600/70 dark:text-base-300/50">{group}</p>
            {(Object.entries(FIELD_TYPE_META) as [FieldType, typeof FIELD_TYPE_META[FieldType]][])
              .filter(([, meta]) => meta.group === group)
              .map(([type, meta]) => (
                <button
                  key={type}
                  onClick={() => onAdd(type)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-base-100 dark:hover:bg-base-800 text-left"
                >
                  <meta.icon className="h-4 w-4 text-accent-500 shrink-0" />
                  {meta.label}
                </button>
              ))}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
