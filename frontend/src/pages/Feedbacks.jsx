import { useState, useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/axios';
import { Plus, MessageSquare, Star } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loading } from '@/components/ui/Loading';

const Feedbacks = () => {
  const { user } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ program: '', content: '', rating: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fbRes, progRes] = await Promise.all([
        api.get('/feedbacks/feedbacks/'),
        api.get('/programs/programs/')
      ]);
      setFeedbacks(fbRes.data);
      setPrograms(progRes.data);
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
      await api.post('/feedbacks/feedbacks/', formData);
      setModalOpen(false);
      setFormData({ program: '', content: '', rating: 5 });
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/feedbacks/feedbacks/${id}/`, { status });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <Loading text="Loading Feedbacks..." />;

  const canCreate = user?.role === 'PENERIMA_MANFAAT' || user?.role === 'STAFF_LAPANGAN';
  const canUpdate = user?.role === 'MANAGER' || user?.role === 'STAFF_OPERATIONAL';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Feedbacks</h1>
          <p className="text-slate-500 text-lg">Manage and review feedback from beneficiaries.</p>
        </div>
        {canCreate && (
          <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button className="px-6">
                <Plus className="mr-2 h-4 w-4" /> Submit Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Submit Feedback</DialogTitle>
                <DialogDescription>
                  Share your experience and thoughts about the program.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                <div className="space-y-3">
                  <Label htmlFor="program" className="font-semibold text-slate-700 dark:text-slate-300">Select Program</Label>
                  <Select required value={formData.program} onValueChange={v => setFormData({...formData, program: v})}>
                    <SelectTrigger className="rounded-lg h-12">
                      <SelectValue placeholder="-- Select a program --">
                        {formData.program 
                          ? programs.find(p => p.id.toString() === formData.program)?.title 
                          : "-- Select a program --"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="font-semibold text-slate-700 dark:text-slate-300">Rating (1-5)</Label>
                  <div className="flex gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl justify-center">
                    {[1,2,3,4,5].map(num => (
                      <button 
                        key={num} type="button" 
                        onClick={() => setFormData({...formData, rating: num})}
                        className={`p-3 rounded-full transition-all duration-200 transform hover:scale-110 ${formData.rating >= num ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-300 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        <Star fill={formData.rating >= num ? "currentColor" : "none"} className="w-8 h-8" strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="content" className="font-semibold text-slate-700 dark:text-slate-300">Feedback / Evaluasi</Label>
                  <textarea 
                    id="content" 
                    required 
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})} 
                    className="flex min-h-[120px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none shadow-sm"
                    placeholder="Tuliskan pengalaman atau masukan Anda secara detail..."
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="px-8">
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {feedbacks.map(fb => (
          <Card key={fb.id} className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 group">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row md:items-start p-6 md:p-8 gap-6 relative">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  fb.status === 'RESOLVED' ? 'bg-emerald-500' :
                  fb.status === 'REVIEWED' ? 'bg-blue-500' : 'bg-amber-400'
                }`} />
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-xl shrink-0 hidden md:flex items-center justify-center">
                  <MessageSquare size={28} strokeWidth={1.5} />
                </div>
                
                <div className="flex-1 space-y-4 min-w-0">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">{fb.program_detail?.title}</h3>
                      <div className="flex items-center flex-wrap gap-2 text-sm text-slate-500 font-medium">
                        <span className="text-slate-700 dark:text-slate-300 font-semibold">{fb.user_detail?.username}</span>
                        <span>•</span>
                        <span>{new Date(fb.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        fb.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                        fb.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}>
                        {fb.status}
                      </span>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill={i < fb.rating ? "currentColor" : "none"} className={i < fb.rating ? '' : 'text-slate-300 dark:text-slate-700'} strokeWidth={1.5} />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-5 rounded-lg break-words text-base leading-relaxed border border-slate-100 dark:border-slate-800">
                    {fb.content}
                  </div>
                  
                  {canUpdate && fb.status !== 'RESOLVED' && (
                    <div className="pt-2 flex flex-wrap gap-3">
                      {fb.status === 'PENDING' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(fb.id, 'REVIEWED')} className="rounded-lg text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-900 dark:hover:bg-blue-900/30">
                          Mark as Reviewed
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => updateStatus(fb.id, 'RESOLVED')} className="rounded-lg text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 dark:border-emerald-900 dark:hover:bg-emerald-900/30">
                        Mark as Resolved
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {feedbacks.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
            <MessageSquare size={48} className="mb-4 text-slate-300 dark:text-slate-700" strokeWidth={1} />
            <p className="text-lg font-medium">No feedbacks yet</p>
            <p className="text-sm">When a feedback is submitted, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedbacks;
