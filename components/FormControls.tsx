"use client";

import { Icon } from "@/components/icons/Icon";
import {
  useId,
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import Select, { type GroupBase, type StylesConfig } from "react-select";
import AsyncSelect from "react-select/async";

const baseControlClassName =
  "w-full rounded-2xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/20 transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white/[0.08]";

const labelClassName =
  "block px-1 text-xs font-semibold uppercase tracking-widest text-white/50";

/** Portal เมนูไป body + fixed เพื่อไม่ถูกตัดโดย overflow / ถูกทับโดย layout ด้านล่าง */
function resolveSelectMenuPortal(
  menuPortalTarget: HTMLElement | null | undefined,
): { target: HTMLElement | undefined; position: "fixed" | undefined } {
  if (menuPortalTarget === null) {
    return { target: undefined, position: undefined };
  }
  const target =
    menuPortalTarget ??
    (typeof document !== "undefined" ? document.body : undefined);
  return {
    target,
    position: target ? "fixed" : undefined,
  };
}

function renderLabel(label?: string, required?: boolean) {
  if (!label) return null;
  return (
    <label className={labelClassName}>
      {label}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
  );
}

export type Select2Option = {
  value: string;
  label: string;
};

const select2Styles: StylesConfig<
  Select2Option,
  false,
  GroupBase<Select2Option>
> = {
  control: (base, state) => ({
    ...base,
    minHeight: "56px",
    borderRadius: ".5rem",
    borderColor: state.isFocused ? "#8b5cf6" : "rgba(255,255,255,0.10)",
    boxShadow: state.isFocused ? "0 0 0 1px #8b5cf6" : "none",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff",
    "&:hover": {
      borderColor: "#8b5cf6",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: ".5rem",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.1)",
    backgroundColor: "#11121a",
    zIndex: 30,
  }),
  menuList: (base) => ({
    ...base,
    padding: "6px",
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: "0.75rem",
    cursor: "pointer",
    backgroundColor: state.isFocused
      ? "rgba(139,92,246,0.2)"
      : state.isSelected
        ? "rgba(139,92,246,0.28)"
        : "transparent",
    color: "#fff",
    "&:active": {
      backgroundColor: "rgba(139,92,246,0.35)",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "#fff",
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.4)",
  }),
  input: (base) => ({
    ...base,
    color: "#fff",
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: "rgba(255,255,255,0.14)",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#fff" : "rgba(255,255,255,0.6)",
    "&:hover": { color: "#fff" },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.6)",
    "&:hover": { color: "#fff" },
  }),
  loadingMessage: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.6)",
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.6)",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "rgba(139,92,246,0.22)",
    borderRadius: "0.5rem",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#fff",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.8)",
    ":hover": {
      backgroundColor: "rgba(139,92,246,0.4)",
      color: "#fff",
    },
  }),
};

type ThemedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  onChangeAction?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const ThemedInput = forwardRef<HTMLInputElement, ThemedInputProps>(
  (
    {
      label,
      className = "",
      leftSlot,
      rightSlot,
      required,
      onChangeAction,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="space-y-2">
        {renderLabel(label, required)}
        <div className="relative">
          {leftSlot ? (
            <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-white/40">
              {leftSlot}
            </div>
          ) : null}
          <input
            ref={ref}
            className={[
              baseControlClassName,
              leftSlot ? "pl-12" : "px-6",
              rightSlot ? "pr-14" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            required={required}
            onChange={onChangeAction}
            {...props}
          />
          {rightSlot ? (
            <div className="absolute inset-y-0 right-4 flex items-center">
              {rightSlot}
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);

ThemedInput.displayName = "ThemedInput";

type ThemedSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  label?: string;
  onChangeAction?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const ThemedSelect = forwardRef<HTMLSelectElement, ThemedSelectProps>(
  ({ label, className = "", children, required, onChangeAction, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {renderLabel(label, required)}
        <div className="relative">
          <select
            ref={ref}
            className={[
              baseControlClassName,
              "appearance-none px-6 pr-12",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            required={required}
            onChange={onChangeAction}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white/60">
            <Icon name="chevron-down" className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  },
);

ThemedSelect.displayName = "ThemedSelect";

type ThemedSelect2Props = {
  label?: string;
  required?: boolean;
  value: Select2Option | null;
  options: Select2Option[];
  onChangeAction: (option: Select2Option | null) => void;
  placeholder?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
  size?: "default" | "sm";
  /** ส่ง null เพื่อไม่ใช้ portal (เมนูอยู่ใน DOM เดิม) */
  menuPortalTarget?: HTMLElement | null;
};

export function ThemedSelect2({
  label,
  required = false,
  value,
  options,
  onChangeAction,
  placeholder = "Select...",
  isClearable = true,
  isDisabled = false,
  size = "default",
  menuPortalTarget,
}: ThemedSelect2Props) {
  const isSmall = size === "sm";
  const instanceId = useId();
  const { target: portalTarget, position: menuPosition } =
    resolveSelectMenuPortal(menuPortalTarget);
  const controlStyles: StylesConfig<
    Select2Option,
    false,
    GroupBase<Select2Option>
  > = {
    ...select2Styles,
    control: (base, state) => ({
      ...select2Styles.control?.(base, state),
      minHeight: isSmall ? "40px" : "56px",
    }),
    valueContainer: (base) => ({
      ...base,
      minHeight: isSmall ? "40px" : "56px",
      padding: isSmall ? "0 8px" : base.padding,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 100_000,
    }),
  };

  return (
    <div className="space-y-2">
      {renderLabel(label, required)}
      <Select<Select2Option, false>
        instanceId={instanceId}
        inputId={`${instanceId}-input`}
        value={value}
        options={options}
        onChange={(option) => onChangeAction(option)}
        placeholder={placeholder}
        isClearable={isClearable}
        isDisabled={isDisabled}
        styles={controlStyles}
        menuPortalTarget={portalTarget}
        menuPosition={menuPosition}
      />
    </div>
  );
}

type ThemedMultiSelect2Props = {
  label?: string;
  required?: boolean;
  value: Select2Option[];
  options: Select2Option[];
  onChangeAction: (option: Select2Option[]) => void;
  placeholder?: string;
  isDisabled?: boolean;
  size?: "default" | "sm";
  menuPortalTarget?: HTMLElement | null;
};

export function ThemedMultiSelect2({
  label,
  required = false,
  value,
  options,
  onChangeAction,
  placeholder = "Select...",
  isDisabled = false,
  size = "default",
  menuPortalTarget,
}: ThemedMultiSelect2Props) {
  const isSmall = size === "sm";
  const instanceId = useId();
  const { target: portalTarget, position: menuPosition } =
    resolveSelectMenuPortal(menuPortalTarget);
  const controlStyles: StylesConfig<
    Select2Option,
    true,
    GroupBase<Select2Option>
  > = {
    ...(select2Styles as unknown as StylesConfig<
      Select2Option,
      true,
      GroupBase<Select2Option>
    >),
    control: (base, state) => ({
      ...base,
      borderRadius: ".5rem",
      borderColor: state.isFocused ? "#8b5cf6" : "rgba(255,255,255,0.10)",
      boxShadow: state.isFocused ? "0 0 0 1px #8b5cf6" : "none",
      backgroundColor: "rgba(255,255,255,0.05)",
      color: "#fff",
      "&:hover": {
        borderColor: "#8b5cf6",
      },
      minHeight: isSmall ? "40px" : "56px",
    }),
    valueContainer: (base) => ({
      ...base,
      minHeight: isSmall ? "40px" : "56px",
      padding: isSmall ? "0 8px" : base.padding,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 100_000,
    }),
  };

  return (
    <div className="space-y-2">
      {renderLabel(label, required)}
      <Select<Select2Option, true>
        isMulti
        instanceId={instanceId}
        inputId={`${instanceId}-input`}
        value={value}
        options={options}
        onChange={(option) => onChangeAction([...option])}
        placeholder={placeholder}
        isDisabled={isDisabled}
        styles={controlStyles}
        menuPortalTarget={portalTarget}
        menuPosition={menuPosition}
      />
    </div>
  );
}

type ThemedAsyncSelect2Props = {
  label?: string;
  required?: boolean;
  value: Select2Option | null;
  onChangeAction: (option: Select2Option | null) => void;
  loadOptionsAction: (inputValue: string) => Promise<Select2Option[]>;
  placeholder?: string;
  defaultOptions?: Select2Option[] | boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  size?: "default" | "sm";
  menuPortalTarget?: HTMLElement | null;
};

export function ThemedAsyncSelect2({
  label,
  required = false,
  value,
  onChangeAction,
  loadOptionsAction,
  placeholder = "Search...",
  defaultOptions = true,
  isClearable = true,
  isDisabled = false,
  size = "default",
  menuPortalTarget,
}: ThemedAsyncSelect2Props) {
  const instanceId = useId();
  const { target: portalTarget, position: menuPosition } =
    resolveSelectMenuPortal(menuPortalTarget);
  const isSmall = size === "sm";
  const controlStyles: StylesConfig<
    Select2Option,
    false,
    GroupBase<Select2Option>
  > = {
    ...select2Styles,
    control: (base, state) => ({
      ...select2Styles.control?.(base, state),
      minHeight: isSmall ? "40px" : "56px",
    }),
    valueContainer: (base) => ({
      ...base,
      minHeight: isSmall ? "40px" : "56px",
      padding: isSmall ? "0 8px" : base.padding,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 100_000,
    }),
  };

  return (
    <div className="space-y-2">
      {renderLabel(label, required)}
      <AsyncSelect<Select2Option, false>
        instanceId={instanceId}
        inputId={`${instanceId}-input`}
        cacheOptions
        defaultOptions={defaultOptions}
        value={value}
        loadOptions={loadOptionsAction}
        onChange={(option) => onChangeAction(option)}
        placeholder={placeholder}
        isClearable={isClearable}
        isDisabled={isDisabled}
        styles={controlStyles}
        menuPortalTarget={portalTarget}
        menuPosition={menuPosition}
      />
    </div>
  );
}

type ThemedAsyncMultiSelect2Props = {
  label?: string;
  required?: boolean;
  value: Select2Option[];
  onChangeAction: (option: Select2Option[]) => void;
  loadOptionsAction: (inputValue: string) => Promise<Select2Option[]>;
  placeholder?: string;
  defaultOptions?: Select2Option[] | boolean;
  isDisabled?: boolean;
  size?: "default" | "sm";
  menuPortalTarget?: HTMLElement | null;
};

export function ThemedAsyncMultiSelect2({
  label,
  required = false,
  value,
  onChangeAction,
  loadOptionsAction,
  placeholder = "Search...",
  defaultOptions = true,
  isDisabled = false,
  size = "default",
  menuPortalTarget,
}: ThemedAsyncMultiSelect2Props) {
  const instanceId = useId();
  const { target: portalTarget, position: menuPosition } =
    resolveSelectMenuPortal(menuPortalTarget);
  const isSmall = size === "sm";
  const controlStyles: StylesConfig<
    Select2Option,
    true,
    GroupBase<Select2Option>
  > = {
    ...(select2Styles as unknown as StylesConfig<
      Select2Option,
      true,
      GroupBase<Select2Option>
    >),
    control: (base, state) => ({
      ...base,
      borderRadius: ".5rem",
      borderColor: state.isFocused ? "#8b5cf6" : "rgba(255,255,255,0.10)",
      boxShadow: state.isFocused ? "0 0 0 1px #8b5cf6" : "none",
      backgroundColor: "rgba(255,255,255,0.05)",
      color: "#fff",
      "&:hover": {
        borderColor: "#8b5cf6",
      },
      minHeight: isSmall ? "40px" : "56px",
    }),
    valueContainer: (base) => ({
      ...base,
      minHeight: isSmall ? "40px" : "56px",
      padding: isSmall ? "0 8px" : base.padding,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 100_000,
    }),
  };

  return (
    <div className="space-y-2">
      {renderLabel(label, required)}
      <AsyncSelect<Select2Option, true>
        isMulti
        instanceId={instanceId}
        inputId={`${instanceId}-input`}
        cacheOptions
        defaultOptions={defaultOptions}
        value={value}
        loadOptions={loadOptionsAction}
        onChange={(option) => onChangeAction([...(option ?? [])])}
        placeholder={placeholder}
        isDisabled={isDisabled}
        styles={controlStyles}
        menuPortalTarget={portalTarget}
        menuPosition={menuPosition}
      />
    </div>
  );
}

type ThemedTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> & {
  label?: string;
  onChangeAction?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export const ThemedTextarea = forwardRef<
  HTMLTextAreaElement,
  ThemedTextareaProps
>(({ label, className = "", required, onChangeAction, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {renderLabel(label, required)}
      <textarea
        ref={ref}
        className={[baseControlClassName, "min-h-32 resize-y px-6 py-4", className]
          .filter(Boolean)
          .join(" ")}
        required={required}
        onChange={onChangeAction}
        {...props}
      />
    </div>
  );
});

ThemedTextarea.displayName = "ThemedTextarea";
