interface LoadingProps {
  iconSize?: number;
  textSize?: number;
  text?: string;
  fillSpace?: boolean;
}

export default function Loading({
  iconSize = 24,
  textSize = 14,
  text = "Carregando...",
  fillSpace = false,
}: LoadingProps) {
  return (
    <div className={`loading! text-center! flex! flex-col! items-center! justify-center! ${fillSpace ? "h-[100%] w-[100%]" : ""}`}>
      <i
        className={` fa-solid fa-spinner fa-spin text-(--accent-color)!`}
        style={{ fontSize: `${iconSize}px` }}
      ></i>
      <p className={`text-[${textSize}px]! text-(--text-secondary-color)!`}>
        {text}
      </p>
    </div>
  );
}
