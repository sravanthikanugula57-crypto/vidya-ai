import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageCircle, 
  ThumbsUp, 
  ShieldCheck, 
  PlusCircle, 
  Search, 
  Send, 
  Database, 
  Sparkles, 
  Award, 
  Pin, 
  Lock, 
  CornerDownRight, 
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { soundFx } from '../../../lib/audio';
import { 
  subscribeToClassDiscussions, 
  createDiscussionPost, 
  addDiscussionReply, 
  likeDiscussionPost, 
  subscribeToDiscussionReplies,
  togglePinDiscussionPost,
  toggleCloseDiscussionPost,
  deleteDiscussionPost,
  DiscussionPost, 
  DiscussionReply 
} from '../../../services/studentFirestoreService';

interface CommunityViewProps {
  studentClassGrade?: string; // e.g. 'Class 10'
  userRole?: 'student' | 'teacher' | 'admin';
  userName?: string;
  userId?: string;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  studentClassGrade = 'Class 10',
  userRole = 'student',
  userName = 'Student User',
  userId = 'user_123'
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(studentClassGrade);
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active expanded discussion for viewing replies
  const [activeDiscussionId, setActiveDiscussionId] = useState<string | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [replyText, setReplyText] = useState('');

  // Subscribe to real-time discussions for selected class
  useEffect(() => {
    const unsub = subscribeToClassDiscussions(selectedClass, (fetchedPosts) => {
      setPosts(fetchedPosts);
    });
    return () => unsub();
  }, [selectedClass]);

  // Subscribe to replies of selected discussion
  useEffect(() => {
    if (!activeDiscussionId) {
      setReplies([]);
      return;
    }
    const unsub = subscribeToDiscussionReplies(activeDiscussionId, (fetchedReplies) => {
      setReplies(fetchedReplies);
    });
    return () => unsub();
  }, [activeDiscussionId]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    soundFx.playSuccess();
    setIsSubmitting(true);
    try {
      await createDiscussionPost({
        classId: selectedClass,
        title: newTitle.trim(),
        content: newContent.trim(),
        authorId: userId,
        authorName: userName,
        authorRole: (userRole || 'student') as 'student' | 'teacher' | 'admin'
      });
      setNewTitle('');
      setNewContent('');
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDiscussionId || !replyText.trim()) return;

    soundFx.playSuccess();
    try {
      await addDiscussionReply(activeDiscussionId, {
        discussionId: activeDiscussionId,
        authorId: userId,
        authorName: userName,
        authorRole: (userRole || 'student') as 'student' | 'teacher' | 'admin',
        content: replyText.trim()
      });
      setReplyText('');
    } catch (err) {
      console.error("Failed to add reply:", err);
    }
  };

  const handleLikePost = async (id: string) => {
    soundFx.playPop();
    await likeDiscussionPost(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Real-time Firestore Discussion Room</span>
          </div>
          <h2 className="text-2xl font-black mt-1">{selectedClass} Class Discussion Room</h2>
          <p className="text-xs text-sky-100 mt-1 max-w-xl">
            Ask doubts, share homework solutions, and collaborate live with teachers and classmates in {selectedClass}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-sky-200">Class Room:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white font-extrabold text-xs focus:outline-none"
          >
            <option value="Class 5" className="text-slate-900">Class 5</option>
            <option value="Class 6" className="text-slate-900">Class 6</option>
            <option value="Class 7" className="text-slate-900">Class 7</option>
            <option value="Class 8" className="text-slate-900">Class 8</option>
            <option value="Class 9" className="text-slate-900">Class 9</option>
            <option value="Class 10" className="text-slate-900">Class 10</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Post Question Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-blue-500" /> Start a New Topic in {selectedClass}
          </h3>

          <form onSubmit={handleCreatePost} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Topic Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. How to solve Snell's Law numericals?"
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Detailed Explanation / Question</label>
              <textarea
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Describe your doubt or problem in detail..."
                rows={4}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting...' : 'Post to Discussion Room'}</span>
            </button>
          </form>
        </div>

        {/* Discussion Posts Feed */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Recent Class Discussions ({posts.length})</span>
            <span className="text-xs text-blue-600 font-bold">Real-time Firestore Sync</span>
          </h3>

          {posts.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <MessageCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-extrabold text-slate-500">No discussion topics in {selectedClass} yet.</p>
              <p className="text-[11px] text-slate-400">Be the first to start a conversation above!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border ${
                  post.isPinned 
                    ? 'border-amber-400 dark:border-amber-600/60 bg-amber-50/20' 
                    : 'border-slate-200 dark:border-slate-800'
                } shadow-sm space-y-3`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {post.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {post.classId}
                      </span>
                      {post.authorRole === 'teacher' && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Teacher
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white mt-1">{post.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{post.content}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{post.authorName}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center gap-1 text-slate-500 hover:text-blue-600 font-bold transition cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.likes}</span>
                    </button>

                    <button
                      onClick={() => setActiveDiscussionId(activeDiscussionId === post.id ? null : post.id)}
                      className="flex items-center gap-1 text-blue-600 font-extrabold hover:underline transition cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{post.repliesCount || 0} Replies</span>
                    </button>

                    {userRole === 'teacher' && (
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => togglePinDiscussionPost(post.id, post.isPinned)}
                          className="p-1 text-slate-400 hover:text-amber-500"
                          title="Pin/Unpin"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteDiscussionPost(post.id)}
                          className="p-1 text-slate-400 hover:text-red-500"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Replies Section */}
                {activeDiscussionId === post.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
                    <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Discussion Thread</h5>

                    <div className="space-y-2">
                      {replies.length === 0 ? (
                        <p className="text-[11px] text-slate-400 font-medium">No replies yet. Type a response below.</p>
                      ) : (
                        replies.map((reply) => (
                          <div key={reply.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                            <div className="flex items-center justify-between font-extrabold text-slate-800 dark:text-slate-200 text-[11px]">
                              <span className="flex items-center gap-1.5">
                                <CornerDownRight className="w-3 h-3 text-blue-500" />
                                {reply.authorName}
                                {reply.authorRole === 'teacher' && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black">Teacher</span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400">{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 font-medium pl-4">{reply.content}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Reply Input */}
                    <form onSubmit={handleAddReply} className="flex gap-2 pt-1">
                      <input
                        type="text"
                        required
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a helpful response..."
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs cursor-pointer"
                      >
                        Reply
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-mono">
          <Database className="w-3.5 h-3.5 text-blue-500" />
          <span>Forum Database: Firestore /discussions</span>
        </span>
        <span>AI Toxicity Filter & Moderator Enabled</span>
      </div>
    </div>
  );
};
