import { Link } from "react-router-dom";
import { Swords } from "lucide-react";

export const Header = () => {
  return (
    <header className="py-4 px-6 border-b bg-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Swords className="h-6 w-6 text-primary" />
          Team Poker
        </Link>
      </div>
    </header>
  );
};