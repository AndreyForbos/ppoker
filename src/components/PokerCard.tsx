import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface PokerCardProps {
  value: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export const PokerCard = ({
  value,
  isSelected,
  onSelect,
  disabled = false,
}: PokerCardProps) => {
  return (
    <button
      onClick={() => onSelect(value)}
      className="w-20 h-28"
      disabled={disabled}
    >
      <Card
        className={cn(
          "w-full h-full flex items-center justify-center transition-all duration-200",
          isSelected
            ? "bg-primary text-primary-foreground transform -translate-y-2 shadow-lg"
            : "bg-white",
          disabled
            ? "bg-gray-200 cursor-not-allowed"
            : "hover:bg-gray-100 hover:shadow-md"
        )}
      >
        <CardContent className="p-0">
          <span className="text-2xl font-bold">{value}</span>
        </CardContent>
      </Card>
    </button>
  );
};