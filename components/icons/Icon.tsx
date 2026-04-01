type IconProps = {
  name: string;
  className?: string;
};

export function Icon({ name, className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      color="currentColor"
    >
      <use href={`#icon-${name}`} />
    </svg>
  );
}
