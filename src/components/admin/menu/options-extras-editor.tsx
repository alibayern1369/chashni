"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Extra, OptionGroup, OptionItem } from "@/lib/types";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function OptionsExtrasEditor({
  options,
  extras,
  onChangeOptions,
  onChangeExtras,
  isRtl,
}: {
  options: OptionGroup[];
  extras: Extra[];
  onChangeOptions: (next: OptionGroup[]) => void;
  onChangeExtras: (next: Extra[]) => void;
  isRtl: boolean;
}) {
  const inputCls =
    "w-full rounded-lg border border-[#333] bg-[#1a1a1a] px-2.5 py-2 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50";

  const addGroup = () => {
    onChangeOptions([
      ...options,
      {
        id: `g-${uid()}`,
        nameFa: "",
        nameEn: "",
        type: "radio",
        required: false,
        options: [{ id: `o-${uid()}`, nameFa: "", nameEn: "", priceModifier: 0 }],
      },
    ]);
  };

  const updateGroup = (idx: number, patch: Partial<OptionGroup>) => {
    const next = options.map((g, i) => (i === idx ? { ...g, ...patch } : g));
    onChangeOptions(next);
  };

  const updateOption = (gi: number, oi: number, patch: Partial<OptionItem>) => {
    const next = options.map((g, i) => {
      if (i !== gi) return g;
      return {
        ...g,
        options: g.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)),
      };
    });
    onChangeOptions(next);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#666]">
            {isRtl ? "آپشن‌ها (گروه‌ها)" : "Option groups"}
          </h4>
          <button
            type="button"
            onClick={addGroup}
            className="flex items-center gap-1 rounded-lg bg-[#1e1e1e] px-2.5 py-1.5 text-[11px] text-amber-400"
          >
            <Plus size={12} />
            {isRtl ? "گروه جدید" : "Add group"}
          </button>
        </div>

        {options.length === 0 && (
          <p className="text-xs text-[#555]">
            {isRtl ? "آپشنی تعریف نشده" : "No option groups"}
          </p>
        )}

        {options.map((g, gi) => (
          <div key={g.id} className="space-y-2 rounded-xl border border-[#2a2010] bg-[#121212] p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className={inputCls}
                placeholder={isRtl ? "نام گروه (فارسی)" : "Group name FA"}
                value={g.nameFa}
                onChange={(e) => updateGroup(gi, { nameFa: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder={isRtl ? "نام گروه (انگلیسی)" : "Group name EN"}
                value={g.nameEn}
                onChange={(e) => updateGroup(gi, { nameEn: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className={inputCls + " w-auto"}
                value={g.type}
                onChange={(e) =>
                  updateGroup(gi, { type: e.target.value as "radio" | "checkbox" })
                }
              >
                <option value="radio">{isRtl ? "تک‌انتخابی" : "Radio"}</option>
                <option value="checkbox">{isRtl ? "چندانتخابی" : "Checkbox"}</option>
              </select>
              <label className="flex items-center gap-1.5 text-[11px] text-[#ccc]">
                <input
                  type="checkbox"
                  checked={g.required}
                  onChange={(e) => updateGroup(gi, { required: e.target.checked })}
                  className="accent-amber-500"
                />
                {isRtl ? "اجباری" : "Required"}
              </label>
              <button
                type="button"
                onClick={() => onChangeOptions(options.filter((_, i) => i !== gi))}
                className="ms-auto text-[#666] hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="space-y-2 border-t border-[#1e1e1e] pt-2">
              {g.options.map((o, oi) => (
                <div key={o.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_100px_auto]">
                  <input
                    className={inputCls}
                    placeholder={isRtl ? "گزینه فارسی" : "Option FA"}
                    value={o.nameFa}
                    onChange={(e) => updateOption(gi, oi, { nameFa: e.target.value })}
                  />
                  <input
                    className={inputCls}
                    placeholder={isRtl ? "گزینه انگلیسی" : "Option EN"}
                    value={o.nameEn}
                    onChange={(e) => updateOption(gi, oi, { nameEn: e.target.value })}
                  />
                  <input
                    type="number"
                    className={inputCls}
                    placeholder={isRtl ? "قیمت+" : "+price"}
                    value={o.priceModifier}
                    onChange={(e) =>
                      updateOption(gi, oi, { priceModifier: parseInt(e.target.value, 10) || 0 })
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateGroup(gi, {
                        options: g.options.filter((_, j) => j !== oi),
                      })
                    }
                    className="text-[#666] hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  updateGroup(gi, {
                    options: [
                      ...g.options,
                      { id: `o-${uid()}`, nameFa: "", nameEn: "", priceModifier: 0 },
                    ],
                  })
                }
                className="text-[11px] text-amber-400"
              >
                + {isRtl ? "گزینه" : "option"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#666]">
            {isRtl ? "افزودنی‌ها (Extras)" : "Extras"}
          </h4>
          <button
            type="button"
            onClick={() =>
              onChangeExtras([
                ...extras,
                { id: `e-${uid()}`, nameFa: "", nameEn: "", price: 0, calories: 0 },
              ])
            }
            className="flex items-center gap-1 rounded-lg bg-[#1e1e1e] px-2.5 py-1.5 text-[11px] text-amber-400"
          >
            <Plus size={12} />
            {isRtl ? "افزودنی" : "Add extra"}
          </button>
        </div>
        {extras.map((ex, i) => (
          <div key={ex.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_100px_80px_auto]">
            <input
              className={inputCls}
              placeholder={isRtl ? "نام فارسی" : "Name FA"}
              value={ex.nameFa}
              onChange={(e) => {
                const next = extras.map((x, j) =>
                  j === i ? { ...x, nameFa: e.target.value } : x,
                );
                onChangeExtras(next);
              }}
            />
            <input
              className={inputCls}
              placeholder={isRtl ? "نام انگلیسی" : "Name EN"}
              value={ex.nameEn}
              onChange={(e) => {
                const next = extras.map((x, j) =>
                  j === i ? { ...x, nameEn: e.target.value } : x,
                );
                onChangeExtras(next);
              }}
            />
            <input
              type="number"
              className={inputCls}
              placeholder={isRtl ? "قیمت" : "Price"}
              value={ex.price}
              onChange={(e) => {
                const next = extras.map((x, j) =>
                  j === i ? { ...x, price: parseInt(e.target.value, 10) || 0 } : x,
                );
                onChangeExtras(next);
              }}
            />
            <input
              type="number"
              className={inputCls}
              placeholder={isRtl ? "کالری" : "Cal"}
              value={ex.calories ?? 0}
              onChange={(e) => {
                const next = extras.map((x, j) =>
                  j === i ? { ...x, calories: parseInt(e.target.value, 10) || 0 } : x,
                );
                onChangeExtras(next);
              }}
            />
            <button
              type="button"
              onClick={() => onChangeExtras(extras.filter((_, j) => j !== i))}
              className="text-[#666] hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
