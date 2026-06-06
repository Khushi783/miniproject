import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Users, Calendar, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [message, setMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const projData = docSnap.data();
          setProject({ id: docSnap.id, ...projData });
          
          if (projData.ownerId) {
            const ownerSnap = await getDoc(doc(db, 'users', projData.ownerId));
            if (ownerSnap.exists()) {
              setOwner(ownerSnap.data());
            }
          }
        } else {
          toast.error("Project not found");
          navigate('/projects/browse');
        }
      } catch (error: any) {
        console.error(error);
        toast.error("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId, navigate]);

  const handleSendJoinRequest = async () => {
    if (!user || !project) return;
    setSendingRequest(true);
    try {
      await addDoc(collection(db, 'requests'), {
        projectId: project.id,
        projectTitle: project.title,
        ownerId: project.ownerId,
        studentId: user.uid,
        studentName: userProfile?.name || 'Unknown',
        message: message.trim(),
        status: 'Pending',
        createdAt: new Date().toISOString()
      });
      toast.success("Join request sent successfully!");
      setIsDialogOpen(false);
      setMessage('');
    } catch (error: any) {
      toast.error('Failed to send request: ' + error.message);
    } finally {
      setSendingRequest(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!project) return null;

  const isOwner = user?.uid === project.ownerId;
  const isMember = project.currentMembers?.includes(user?.uid);
  const spotsLeft = project.teamSize - (project.currentMembers?.length || 1);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-4 text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{project.category}</Badge>
              <Badge variant="outline" className="text-slate-600">{project.difficulty}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{project.title}</h1>
            <p className="text-slate-600 mb-6">Posted on {new Date(project.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="prose prose-slate max-w-none">
            <h3 className="text-xl font-bold text-slate-900 mb-3">Project Description</h3>
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              {project.description}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {project.skillsRequired?.map((skill: string) => (
                <Badge key={skill} variant="secondary" className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 font-medium">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg border-slate-100 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-3 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Team Size</p>
                    <p className="font-bold text-slate-900">{project.currentMembers?.length || 1} / {project.teamSize} Members</p>
                  </div>
                </div>
                
                {project.deadline && (
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-3 rounded-lg"><Calendar className="w-5 h-5 text-indigo-600" /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Deadline</p>
                      <p className="font-bold text-slate-900">{new Date(project.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                <hr className="my-2 border-slate-100" />
                
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Project Lead</p>
                  <p className="font-bold text-slate-900">{owner?.name || project.ownerName}</p>
                  <p className="text-sm text-slate-500">{owner?.branch}</p>
                </div>
              </div>

              <div className="mt-8">
                {isOwner ? (
                  <Button className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200" onClick={() => navigate('/team')}>
                    Manage Requests
                  </Button>
                ) : isMember ? (
                  <Button className="w-full bg-green-100 text-green-700 hover:bg-green-200" disabled>
                    You are a member
                  </Button>
                ) : spotsLeft > 0 ? (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger render={<Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg" />}>
                      Request to Join
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Send Join Request</DialogTitle>
                        <DialogDescription>
                          Write a brief introduction to the project owner explaining why you'd be a good fit.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Textarea 
                          placeholder="I have experience in React and Node and would love to contribute to..."
                          className="h-32"
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                        />
                      </div>
                      <DialogFooter className="sm:justify-end">
                        <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={handleSendJoinRequest} disabled={sendingRequest || !message.trim()} className="bg-blue-600">
                          {sendingRequest ? 'Sending...' : (
                            <><Send className="w-4 h-4 mr-2" /> Send Request</>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button className="w-full" disabled variant="outline">Team is Full</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
