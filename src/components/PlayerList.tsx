import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, CheckCircle2 } from "lucide-react";
import { Player } from "@/types";

interface PlayerListProps {
  players: Player[];
  votesRevealed: boolean;
}

export const PlayerList = ({ players, votesRevealed }: PlayerListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Players ({players.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{player.name}</span>
              </div>
              {votesRevealed ? (
                <span className="font-bold text-lg">{player.vote || "🤔"}</span>
              ) : (
                player.vote && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};