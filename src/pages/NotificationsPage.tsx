import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent } from '../components/ui/card';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const q = query(
          collection(db, 'users', user.uid, 'notifications'), 
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        
        // Mark all as read
        snap.docs.forEach(d => {
          if (!d.data().read) {
            updateDoc(doc(db, 'users', user.uid, 'notifications', d.id), { read: true });
          }
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading notifications...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
          <Bell className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-slate-500">You're all caught up! No notifications yet.</p>
          </div>
        ) : (
          notifications.map(n => (
            <Card key={n.id} className={`transition-colors ${n.read ? 'bg-white' : 'bg-blue-50/50 border-blue-200'}`}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-slate-900">{n.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
