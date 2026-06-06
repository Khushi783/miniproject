import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamManagementPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Projects I own
      const pQ = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
      const pSnap = await getDocs(pQ);
      const projs = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMyProjects(projs);

      // 2. Requests received for my projects
      const inQ = query(collection(db, 'requests'), where('ownerId', '==', user.uid));
      const inSnap = await getDocs(inQ);
      setRequests(inSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // 3. Requests I sent
      const outQ = query(collection(db, 'requests'), where('studentId', '==', user.uid));
      const outSnap = await getDocs(outQ);
      setMyRequests(outSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
    } catch (error) {
      console.error(error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, projectId: string, studentId: string, status: 'Accepted' | 'Rejected') => {
    try {
      // Update request status
      await updateDoc(doc(db, 'requests', requestId), { status });
      
      // If Accepted, add user to project's currentMembers
      if (status === 'Accepted') {
        const projRef = doc(db, 'projects', projectId);
        await updateDoc(projRef, {
          currentMembers: arrayUnion(studentId)
        });
        
        // Let's also create a notification (simplified)
        await addDoc(collection(db, 'users', studentId, 'notifications'), {
          message: `Your request to join team was accepted!`,
          read: false,
          createdAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'users', studentId, 'notifications'), {
          message: `Your request to join team was declined.`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      toast.success(`Request ${status.toLowerCase()}!`);
      fetchData();
    } catch (error: any) {
      toast.error('Action failed: ' + error.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading team data...</div>;

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Team Management</h1>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="requests">Needs Action ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent Requests</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="text-center py-12 bg-slate-50 border-dashed">
              <p className="text-slate-500">No pending requests right now.</p>
            </Card>
          ) : (
            pendingRequests.map(req => (
              <Card key={req.id}>
                <CardHeader className="pb-3 flex flex-row items-start justify-between bg-slate-50 border-b">
                  <div>
                    <CardTitle className="text-lg">Project: {req.projectTitle}</CardTitle>
                    <CardDescription>Request from <span className="font-bold text-slate-900">{req.studentName}</span></CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-slate-700 italic bg-slate-50 p-4 rounded-lg border border-slate-100">"{req.message}"</p>
                  <div className="flex gap-3 mt-6 justify-end">
                    <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleRequestAction(req.id, req.projectId, req.studentId, 'Rejected')}>
                      <X className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleRequestAction(req.id, req.projectId, req.studentId, 'Accepted')}>
                      <Check className="w-4 h-4 mr-2" /> Accept & Add to Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="sent" className="space-y-4">
          {myRequests.length === 0 ? (
            <p className="text-slate-500 py-8 text-center">You haven't sent any requests yet.</p>
          ) : (
            myRequests.map(req => (
              <Card key={req.id}>
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">{req.projectTitle}</p>
                    <p className="text-sm text-slate-500">Sent on {new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge className={
                    req.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                    req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {req.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="projects">
          {myProjects.length === 0 ? (
            <p className="text-slate-500 py-8 text-center">You haven't created any projects yet.</p>
          ) : (
             myProjects.map(proj => (
              <Card key={proj.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{proj.title}</CardTitle>
                  <CardDescription>
                    Team Status: {proj.currentMembers?.length || 1} / {proj.teamSize} filled
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
