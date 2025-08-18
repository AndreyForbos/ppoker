import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateIssueFormProps {
  onAddIssue: (title: string) => void;
}

export const CreateIssueForm = ({ onAddIssue }: CreateIssueFormProps) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddIssue(title.trim());
      setTitle("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter issue title or paste link"
      />
      <Button type="submit">Add Issue</Button>
    </form>
  );
};