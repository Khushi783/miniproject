import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FolderGit2, Users, FileSignature, Activity } from 'lucide-react';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [stats, setStats] = useState({
    myProjects: 0,
    activeRequests: 0,
    joinedTeams: 0
  });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      // Simplistic stat aggregation
      const pQ = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
      const rQ = query(collection(db, 'requests'), where('studentId', '==', user.uid));
      
      const [pSnap, rSnap] = await Promise.all([getDocs(pQ), getDocs(rQ)]);
      
      setStats({
        myProjects: pSnap.size,
        activeRequests: rSnap.size, // In a real app we'd filter pending vs accepted, or member queries
        joinedTeams: rSnap.docs.filter(d => d.data().status === 'Accepted').length
      });
    };
    fetchStats();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {userProfile?.name?.split(' ')[0] || 'Student'}! 👋</h1>
        <p className="text-slate-600">Here's what's happening with your projects and teams today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">My Hosted Projects</CardTitle>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.myProjects}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Sent Requests</CardTitle>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <FileSignature className="w-4 h-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.activeRequests}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Joined Teams</CardTitle>
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.joinedTeams}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center"><Activity className="w-5 h-5 mr-2 text-slate-400"/> Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/projects/create">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 border-dashed border-2 hover:bg-slate-50 hover:border-blue-300">
                <FolderGit2 className="w-6 h-6 text-blue-500" />
                Post New Project
              </Button>
            </Link>
            <Link to="/projects/browse">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 border-dashed border-2 hover:bg-slate-50 hover:border-indigo-300">
                <Search className="w-6 h-6 text-indigo-500" />
                Browse Ideas
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="border-slate-100 shadow-sm bg-blue-600 text-white overflow-hidden relative">
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="100" cy="100" r="100" />
            </svg>
          </div>
          <CardHeader>
            <CardTitle className="text-white">Profile Strength</CardTitle>
            <CardDescription className="text-blue-100">Stand out to other project owners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2 space-y-4 relative z-10">
              <div className="flex justify-between items-end mb-1">
                <span className="font-bold text-2xl">
                  {userProfile?.skills && userProfile.skills.length > 0 ? 'Good' : 'Needs work'}
                </span>
              </div>
              <div className="w-full bg-blue-800 rounded-full h-2 mb-4">
                <div className="bg-white h-2 rounded-full" style={{ width: userProfile?.skills && userProfile.skills.length > 0 ? '80%' : '30%' }}></div>
              </div>
              <p className="text-sm text-blue-100 mb-4">Add more skills, bio, and your GitHub/LinkedIn links to increase match rates.</p>
              <Link to="/profile">
                <Button variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50">Update Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
// Fix missing Search import for Dashboard
import { Search } from 'lucide-react';
