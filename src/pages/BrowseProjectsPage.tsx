import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Search, Filter, Users, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function BrowseProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const projs: any[] = [];
        querySnapshot.forEach((doc) => {
          projs.push({ id: doc.id, ...doc.data() });
        });
        setProjects(projs);
      } catch (error: any) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.skillsRequired?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Explore Projects</h1>
          <p className="text-slate-600">Find exciting ideas and join a team that matches your skills.</p>
        </div>
        <Link to="/projects/create">
          <Button className="bg-blue-600 hover:bg-blue-700">Post a Project</Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            placeholder="Search by title, skills, or category..." 
            className="pl-10 h-12 text-base shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 px-4 shadow-sm border-slate-300">
          <Filter className="w-5 h-5 mr-2" /> Filters
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <p className="text-lg text-slate-600 font-medium mb-2">No projects found.</p>
          <p className="text-slate-500">Try adjusting your search terms or be the first to post an idea!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow border-slate-200 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 font-normal">
                    {project.category}
                  </Badge>
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                    {project.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{project.title}</h3>
                <p className="text-sm text-slate-500">Posted by {project.ownerName}</p>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <p className="text-slate-600 text-sm line-clamp-3 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.skillsRequired?.slice(0, 4).map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs font-normal">
                      {skill}
                    </Badge>
                  ))}
                  {project.skillsRequired?.length > 4 && (
                    <Badge variant="secondary" className="text-xs font-normal text-slate-500">
                      +{project.skillsRequired.length - 4} more
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-2 mt-auto text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{project.currentMembers?.length || 1} / {project.teamSize} Members</span>
                  </div>
                  {project.deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-5 px-6">
                <Link to={`/projects/${project.id}`} className="w-full">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
