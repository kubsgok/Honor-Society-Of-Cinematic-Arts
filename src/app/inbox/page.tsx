'use client'

import { useState, useEffect } from 'react'
import { NavBar } from '../components/NavBar'
import { Mail, Calendar, CheckCircle, X } from 'lucide-react'

interface PendingChapter {
  chapter_id: string
  director_id: string
  director_full_name?: string
  director_email?: string
  school: string
  first_month_school: string
  grad_month: string
  submitted_at?: Date
  status?: 'pending' | 'approved'
}

export default function InboxPage() {
  const [chapters, setChapters] = useState<PendingChapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<PendingChapter | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchChapters = async () => {
    const response = await fetch('/api/fetchChapters');
    const data = await response.json();
    console.log("the raw data", data.chaptersData);
    if (!response.ok) {
      console.error('Failed to fetch chapters')
      return;
    }
    const mappedChapters: PendingChapter[] = (data.chaptersData || []).map((chapter: any) => ({
      chapter_id: String(chapter.chapter_number ?? chapter.chapter_id ?? ''),
      director_id: chapter.director_id ?? '',
      school: chapter.school ?? '',
      first_month_school: chapter.first_month_school ?? 'N/A',
      grad_month: chapter.grad_month ?? 'N/A',
      submitted_at: chapter.created_at ? new Date(chapter.created_at) : undefined,
      status: chapter.official ? 'approved' : 'pending',
    }));
    console.log("After fetching chapters", mappedChapters);
    setChapters(mappedChapters);
  }

  const updateChapterDirectors = async () => {
    console.log('updateChapterDirectors called');
    console.log("chapters", chapters);
    for (const chapter of chapters) {
      console.log("chapter", chapter);
      const response = await fetch('/api/fetchUsers');
      // console.log("response", response);
      const data = await response.json();
      console.log("the raw data in chapter directors", data);
      const director = data.filter((user: any) => user.id === chapter.director_id);
      console.log("director", director);
      chapter.director_full_name = director.full_name;
      chapter.director_email = director.email;
    }
    console.log("After updating chapter directors", chapters);
  }
  
  useEffect(() => {
    fetchChapters();
    updateChapterDirectors();
    setLoading(false);
  }, [selectedChapter])

  const openChapterModal = (chapter: PendingChapter) => {
    setSelectedChapter(chapter)
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedChapter(null)
    setShowModal(false)
  }

  const approveChapter = (chapterId: string) => {
    //TODO: make the update chapter api call
  }

  const rejectChapter = (chapterId: string) => {
    //TODO: make the delete chapter api call
  }

  const formatDate = (dateLike: Date | string) => {
    const d = typeof dateLike === 'string' ? new Date(dateLike) : dateLike;
    if (Number.isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const pendingApplications = chapters.filter((chapter: PendingChapter) => chapter.status === 'pending')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Applications</h1>
            <p className="text-gray-600">Review and approve new chapter applications</p>
          </div>

          {/* Applications List */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-semibold text-lg">Pending Applications</h2>
                <p className="text-gray-600 text-sm">
                  {pendingApplications.length} application{pendingApplications.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {pendingApplications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No pending applications</h3>
                <p>All applications have been reviewed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApplications.map((chapter: PendingChapter) => (
                  <div key={chapter.chapter_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{chapter.school}</h3>
                          <span className="text-sm text-gray-600">{chapter.first_month_school} - {chapter.grad_month}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="font-medium">{chapter.director_full_name}</span>
                          <span className="text-sm text-gray-500">{chapter.director_email}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {chapter.submitted_at ? (
                            <>Applied {formatDate(chapter.submitted_at)}</>
                          ) : (
                            <>Submission date not available</>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => openChapterModal(chapter)}
                          className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                          Review Application
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showModal && selectedChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Review Chapter Application</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">School</label>
                  <p className="text-gray-900">{selectedChapter.school}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Director Name</label>
                  <p className="text-gray-900">{selectedChapter.director_full_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Director Email</label>
                  <p className="text-gray-900">{selectedChapter.director_email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">First Month of School</label>
                  <p className="text-gray-900">{selectedChapter.first_month_school}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Graduation Month</label>
                  <p className="text-gray-900 capitalize">{selectedChapter.grad_month}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Applied On</label>
                  <p className="text-gray-900">{selectedChapter.submitted_at ? formatDate(selectedChapter.submitted_at) : 'Submission date not available'}</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectChapter(selectedChapter.chapter_id)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1"
              >
                <X size={16} />
                Reject
              </button>
              <button
                onClick={() => approveChapter(selectedChapter.chapter_id)}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
              >
                <CheckCircle size={16} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
