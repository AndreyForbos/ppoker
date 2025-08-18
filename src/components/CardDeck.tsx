import { PokerCard } from "./PokerCard";

const cardValues = ["0", "1", "2", "3", "5", "8", "13", "21", "?"];

interface CardDeckProps {
  onVote: (value: string) => void;
  selectedCard: string | null;
  disabled?: boolean;
}

export const CardDeck = ({
  onVote,
  selectedCard,
  disabled = false,
}: CardDeckProps) => {
  const handleSelectCard = (value: string) => {
    if (disabled) return;
    onVote(value);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
      <h3 className="text-center text-gray-600 mb-4">Choose your card</h3>
      <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap">
        {cardValues.map((value) => (
          <PokerCard
            key={value}
            value={value}
            isSelected={selectedCard === value}
            onSelect={handleSelectCard}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};