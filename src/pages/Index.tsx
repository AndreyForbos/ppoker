import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState('');

  const createNewGame = () => {
    const newGameId = Math.random().toString(36).substring(2, 8);
    navigate(`/game/${newGameId}`);
  };

  const joinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim()) {
      navigate(`/game/${gameId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Planning Poker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={createNewGame} className="w-full">
            Create New Game
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or Join Existing Game
              </span>
            </div>
          </div>

          <form onSubmit={joinGame} className="flex gap-2">
            <Input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter Game ID"
              className="text-center"
            />
            <Button type="submit">Join</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;