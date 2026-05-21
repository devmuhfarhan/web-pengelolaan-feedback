import { useState, useEffect } from "react";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";
import { Plus, Edit2, Trash2, Calendar, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/Loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Programs = () => {
  const { user } = useAuthStore();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    target_beneficiaries: 0,
    status: "PLANNED",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data } = await api.get("/programs/programs/");
      setPrograms(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/programs/programs/${editingId}/`, formData);
      } else {
        await api.post("/programs/programs/", formData);
      }
      resetForm();
      fetchPrograms();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      start_date: "",
      target_beneficiaries: 0,
      status: "PLANNED",
    });
  };

  const handleEdit = (program) => {
    setEditingId(program.id);
    setFormData({
      title: program.title,
      description: program.description,
      start_date: program.start_date,
      target_beneficiaries: program.target_beneficiaries,
      status: program.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this program?")) return;
    try {
      await api.delete(`/programs/programs/${id}/`);
      fetchPrograms();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <Loading text="Loading Programs..." />;

  const canManage = user?.role === "STAFF_OPERATIONAL";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Programs
          </h1>
          <p className="text-slate-500 text-sm">
            Manage and monitor all community programs.
          </p>
        </div>
        {canManage && (
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            else setModalOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button className="px-6" onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" /> New Program
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editingId ? "Edit Program" : "Create New Program"}
                </DialogTitle>
                <DialogDescription>
                  {editingId ? "Update the program details below." : "Add a new program to the system. Click save when you are done."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Title
                  </Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="h-11 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Description
                  </Label>
                  <textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="flex min-h-[100px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none shadow-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="start_date"
                      className="font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Start Date
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="target"
                      className="font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Target Beneficiaries
                    </Label>
                    <Input
                      id="target"
                      type="number"
                      required
                      value={formData.target_beneficiaries}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          target_beneficiaries: parseInt(e.target.value),
                        })
                      }
                      className="h-11 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="h-11 rounded-lg">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">Planned</SelectItem>
                      <SelectItem value="ONGOING">Ongoing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => resetForm()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8"
                  >
                    {isSubmitting ? "Saving..." : "Save Program"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <Card
            key={program.id}
            className="flex flex-col border-0 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-4 relative">
              <div className="flex justify-between items-start gap-4 pt-2">
                <CardTitle className="text-lg line-clamp-2 leading-tight font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                  {program.title}
                </CardTitle>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                    program.status === "COMPLETED"
                      ? "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                      : program.status === "ONGOING"
                        ? "bg-blue-100/50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                        : "bg-amber-100/50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                  }`}
                >
                  {program.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-slate-600 dark:text-slate-300 line-clamp-3 mb-6 flex-1 text-sm leading-relaxed">
                {program.description}
              </p>
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800 mt-auto">
                <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm font-medium">
                  <div className="bg-primary/10 p-1.5 rounded-lg mr-3">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <span>
                    Target:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {program.target_beneficiaries}
                    </strong>{" "}
                    beneficiaries
                  </span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm font-medium">
                  <div className="bg-primary/10 p-1.5 rounded-lg mr-3">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <span>
                    Start:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {new Date(program.start_date).toLocaleDateString()}
                    </strong>
                  </span>
                </div>
              </div>
            </CardContent>
            {canManage && (
              <CardFooter className="pt-4 pb-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3 px-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                  onClick={() => handleEdit(program)}
                >
                  <Edit2 className="w-4 h-4 mr-2 text-slate-400" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-900/50 dark:hover:bg-red-900/20 font-semibold"
                  onClick={() => handleDelete(program.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
        {programs.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
            <FileText
              size={48}
              className="mb-4 text-slate-300 dark:text-slate-700"
              strokeWidth={1}
            />
            <p className="text-lg font-medium">No programs found</p>
            <p className="text-sm">
              Click 'New Program' to add the first program.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Programs;
