import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Dummy categories for now
const projectCategories = [
  "Biology", "Chemistry", "Physics", "Math", "Computer Science", "Literature", "History", "Geography"
];

export function CreateProjectCard({ onCreateProject }: { onCreateProject: (project: any) => void }) {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectCategory, setProjectCategory] = useState("");

  const handleCreateProject = () => {
    if (projectName && projectCategory) {
      const newProject = {
        id: `project-${Date.now()}`,
        name: projectName,
        category: projectCategory,
        createdAt: new Date().toISOString(),
        progress: 0,
      };
      onCreateProject(newProject);
      setProjectName("");
      setProjectCategory("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="h-full min-h-[220px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 transition-colors hover:border-blue-400 hover:bg-blue-50/50 group w-full">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <p className="mt-4 font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
            Create New Project
          </p>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="project-category">Category</Label>
            <select
              id="project-category"
              value={projectCategory}
              onChange={e => setProjectCategory(e.target.value)}
              className="border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled>Select a category</option>
              {projectCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        <Button onClick={handleCreateProject} disabled={!projectName || !projectCategory} className="w-full">
          Create Project
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectPlaceholderCard() {
  return (
    <div className="h-full min-h-[220px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-6 bg-gray-50/50 w-full">
      <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
        <span className="text-gray-300 text-xl">+</span>
      </div>
    </div>
  );
} 