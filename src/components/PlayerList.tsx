import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "lucide-react";

interface Player {
  name: string;
}

interface PlayerListProps {
  players: Player[];
}

export const PlayerList = ({ players }: PlayerListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Players ({players.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {players.map((player, index) => (
            <li key={index} className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <span className="font-medium">{player.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};