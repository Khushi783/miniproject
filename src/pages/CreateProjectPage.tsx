import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const CATEGORIES = [
  'Web Development', 'App Development', 'Artificial Intelligence',
  'Machine Learning', 'Data Science', 'Cyber Security',
  'IoT', 'Blockchain', 'Cloud Computing', 'Open Source'
];

export default function CreateProjectPage() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    teamSize: '3',
    deadline: '',
    difficulty: 'Intermediate',
    skillInput: ''
  });
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);

  const addSkill = () => {
    const trimmed = formData.skillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills([...requiredSkills, trimmed]);
      setFormData({ ...formData, skillInput: '' });
    }
  };

  const removeSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!formData.title || !formData.category || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (requiredSkills.length === 0) {
      toast.error('Please add at least one required skill');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'projects'), {
        ownerId: user.uid,
        ownerName: userProfile?.name || 'Unknown',
        title: formData.title,
        description: formData.description,
        category: formData.category,
        teamSize: parseInt(formData.teamSize),
        deadline: formData.deadline || null,
        difficulty: formData.difficulty,
        skillsRequired: requiredSkills,
        currentMembers: [user.uid],
        createdAt: new Date().toISOString()
      });
      toast.success('Project created successfully!');
      navigate('/projects/browse');
    } catch (error: any) {
      toast.error('Error creating project: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Project</h1>
        <p className="text-slate-600">Post your idea and find the perfect teammates to build it with.</p>
      </div>

      <Card className="shadow-lg border-slate-100">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">Project Title <span className="text-red-500">*</span></Label>
              <Input 
                id="title" 
                placeholder="e.g. Smart Campus Navigation App" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base">Category <span className="text-red-500">*</span></Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-base">Total Team Size Options</Label>
                <Select value={formData.teamSize} onValueChange={v => setFormData({...formData, teamSize: v})}>
                  <SelectTrigger><SelectValue placeholder="Team Size" /></SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map(num => (
                      <SelectItem key={num} value={String(num)}>{num} members</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Detailed Description <span className="text-red-500">*</span></Label>
              <Textarea 
                id="description" 
                placeholder="Describe your project, goals, what problem it solves, and what kind of specific help you are looking for..." 
                className="h-32"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base">Deadline (Optional)</Label>
                <Input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Difficulty Level</Label>
                <Select value={formData.difficulty} onValueChange={v => setFormData({...formData, difficulty: v})}>
                  <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner Friendly</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Expert">Advanced / Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-base">Required Skills <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input 
                  value={formData.skillInput} 
                  onChange={e => setFormData({...formData, skillInput: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="e.g. React, Node.js, UI Design..."
                />
                <Button type="button" onClick={addSkill} variant="secondary">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 rounded-lg min-h-[3rem] border border-slate-100">
                {requiredSkills.map(skill => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1 text-indigo-400 hover:text-indigo-600 focus:outline-none">×</button>
                  </Badge>
                ))}
                {requiredSkills.length === 0 && <span className="text-sm text-slate-500 my-auto">Add skills to help matching...</span>}
              </div>
            </div>

          </CardContent>
          <CardFooter className="bg-slate-50 rounded-b-xl p-6 border-t border-slate-100 flex justify-end">
            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Project Idea'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
