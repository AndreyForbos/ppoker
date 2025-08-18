import { Link } from "react-router-dom";
import { Swords, Copy, User } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showSuccess } from "@/utils/toast";

interface HeaderProps {
  playerName?: string | null;
}

export const Header = ({ playerName }: HeaderProps) => {
  const handleInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess("Game URL copied to clipboard!");
  };

  return (
    <header className="py-4 px-6 border-b bg-white sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Swords className="h-6 w-6 text-primary" />
          Team Poker
        </Link>
        {playerName && (
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleInvite}>
              <Copy className="h-4 w-4 mr-2" />
              Invite Players
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Signed in as
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {playerName}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};