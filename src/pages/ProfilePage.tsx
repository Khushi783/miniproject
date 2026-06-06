import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Github, Linkedin, FileText, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    semester: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    resumeUrl: '',
    skillsInput: ''
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        branch: userProfile.branch || '',
        semester: userProfile.semester?.toString() || '',
        bio: userProfile.bio || '',
        githubUrl: userProfile.githubUrl || '',
        linkedinUrl: userProfile.linkedinUrl || '',
        resumeUrl: userProfile.resumeUrl || '',
        skillsInput: ''
      });
      setSkills(userProfile.skills || []);
      setInterests(userProfile.interests || []);
    }
  }, [userProfile]);

  const addSkill = () => {
    const trimmed = formData.skillsInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setFormData({ ...formData, skillsInput: '' });
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        name: formData.name,
        branch: formData.branch,
        semester: parseInt(formData.semester) || 1,
        bio: formData.bio,
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl,
        resumeUrl: formData.resumeUrl,
        skills,
        interests
      });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Error updating profile: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600 border border-blue-200">
                <UserIcon className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold">{formData.name || 'Your Name'}</h2>
              <p className="text-slate-500 mb-4">{formData.branch || 'Your Branch'} • Sem {formData.semester || '-'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Github className="w-4 h-4"/> GitHub URL</Label>
                <Input value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} placeholder="https://github.com/username" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Linkedin className="w-4 h-4"/> LinkedIn URL</Label>
                <Input value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} placeholder="https://linkedin.com/in/username" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><FileText className="w-4 h-4"/> Resume URL</Label>
                <Input value={formData.resumeUrl} onChange={e => setFormData({...formData, resumeUrl: e.target.value})} placeholder="Link to Google Drive / Portfolio" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={userProfile?.email} disabled className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Input value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Input type="number" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Tell others about yourself, what you're interested in building..." className="h-24" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input 
                  value={formData.skillsInput} 
                  onChange={e => setFormData({...formData, skillsInput: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="e.g. React, Python, Machine Learning..."
                />
                <Button onClick={addSkill} variant="secondary">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1 text-blue-400 hover:text-blue-600">×</button>
                  </Badge>
                ))}
                {skills.length === 0 && <span className="text-sm text-slate-500">No skills added yet.</span>}
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 flex justify-end p-4 rounded-b-xl border-t border-slate-100">
              <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
