import { Issue, Player } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface IssueListProps {
  issues: Issue[];
  players: Player[];
  onStartVoting: (issueId: number) => void;
  onRevealVotes: (issueId: number) => void;
  onResetVoting: (issueId: number) => void;
}

export const IssueList = ({
  issues,
  players,
  onStartVoting,
  onRevealVotes,
  onResetVoting,
}: IssueListProps) => {
  const getVoteCount = () => {
    return players.filter((p) => p.vote !== null).length;
  };

  const calculateAverage = () => {
    const validVotes = players
      .map((p) => parseInt(p.vote || "", 10))
      .filter((v) => !isNaN(v));
    if (validVotes.length === 0) return "N/A";
    const avg = validVotes.reduce((a, b) => a + b, 0) / validVotes.length;
    return avg.toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues</CardTitle>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <p className="text-sm text-gray-500">No issues added yet.</p>
        ) : (
          <ul className="space-y-4">
            {issues.map((issue) => (
              <li
                key={issue.id}
                className={cn(
                  "p-3 border rounded-lg transition-all",
                  issue.is_voting && "border-primary ring-1 ring-primary"
                )}
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium break-all">{issue.title}</p>
                  {issue.is_voting && issue.votes_revealed && (
                    <span className="font-bold text-lg">{calculateAverage()}</span>
                  )}
                </div>
                <div className="mt-3 flex gap-2 items-center flex-wrap">
                  {!issue.is_voting && (
                    <Button size="sm" onClick={() => onStartVoting(issue.id)}>
                      Start Voting
                    </Button>
                  )}
                  {issue.is_voting && !issue.votes_revealed && (
                    <>
                      <Button size="sm" onClick={() => onRevealVotes(issue.id)}>
                        Reveal Votes
                      </Button>
                      <span className="text-sm text-gray-500">
                        {getVoteCount()} / {players.length} voted
                      </span>
                    </>
                  )}
                  {issue.is_voting && issue.votes_revealed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResetVoting(issue.id)}
                    >
                      Vote Again
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};