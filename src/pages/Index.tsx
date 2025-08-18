import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const [gameId, setGameId] = useState('');
  const navigate = useNavigate();

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim()) {
      navigate(`/game/${gameId.trim()}`);
    }
  };

  const handleCreateGame = () => {
    const newGameId = Math.random().toString(36).substring(2, 8);
    navigate(`/game/${newGameId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Planning Poker</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinGame} className="space-y-4">
            <Input
              placeholder="Enter Game ID to Join"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
            />
            <Button type="submit" className="w-full" disabled={!gameId.trim()}>
              Join Game
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <Button onClick={handleCreateGame} variant="outline" className="w-full">
            Create New Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;