import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Pin,
  PinOff,
  Trash2,
  Lock,
  Sparkles,
  Users,
  ShieldCheck,
  GraduationCap,
  Clock,
  CheckCircle2,
  ChevronLeft,
  CornerDownRight,
  AlertCircle
} from 'lucide-react';
import {
  DiscussionGroupDoc,
  DiscussionPostDoc,
  DiscussionReplyDoc,
  subscribeToGroupPosts,
  createDiscussionPost,
  togglePinDiscussionPost,
  closeDiscussionPost,
  deleteDiscussionPost,
  subscribeToPostReplies,
  createPostReply
} from '../../services/discussionService';
import { soundFx } from '../../lib/audio';

interface ClassDiscussionFeedProps {
  group: DiscussionGroupDoc;
  currentUser: {
    uid: string;
    name: string;
    role: 'mdm' | 'teacher' | 'student';
    email?: string;
  };
  onBack?: () => void;
}

export const ClassDiscussionFeed: React.FC<ClassDiscussionFeedProps> = ({
  group,
  currentUser,
  onBack
}) => {
  const [posts, setPosts] = useState<DiscussionPostDoc[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [isPinChecked, setIsPinChecked] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  const isTeacherOrMdm = currentUser.role === 'teacher' || currentUser.role === 'mdm';
  const currentUserName = (currentUser?.name || (currentUser as any)?.displayName || 'User').trim() || 'User';
  const currentUserInitial = currentUserName.charAt(0).toUpperCase() || 'U';

  // Subscribe to group posts in real-time
  useEffect(() => {
    const unsub = subscribeToGroupPosts(group.groupId, (data) => {
      setPosts(data);
      // Auto-expand replies for all posts that have replies initially
      const initialExpanded: Record<string, boolean> = {};
      data.forEach((p, idx) => {
        const pKey = p.postId || (p as any).id || `post-${idx}`;
        if ((p.replyCount || 0) > 0) {
          initialExpanded[pKey] = true;
        }
      });
      setExpandedReplies((prev) => ({ ...initialExpanded, ...prev }));
    });
    return () => unsub();
  }, [group.groupId]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    soundFx.playPop();
    setIsSubmittingPost(true);
    try {
      await createDiscussionPost({
        groupId: group.groupId,
        message: newPostText.trim(),
        createdBy: currentUser.uid,
        createdByRole: currentUser.role,
        createdByName: currentUserName,
        pinned: isTeacherOrMdm && isPinChecked
      });

      setNewPostText('');
      setIsPinChecked(false);
      soundFx.playSuccess();
    } catch (err) {
      console.error('Error creating discussion post:', err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const toggleRepliesVisibility = (postId: string) => {
    soundFx.playClick();
    setExpandedReplies((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Group Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onBack();
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
                title="Back to Groups"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg shadow-inner">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {group.groupName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Class {group.class}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {group.subject}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {group.board}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {group.description || 'Classroom discussion forum with real-time zero-refresh synchronization.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Firebase Room
            </span>
          </div>
        </div>

        {group.chapterName && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Chapter:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{group.chapterName}</span>
          </div>
        )}
      </div>

      {/* Post Composer */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
              {currentUserInitial}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{currentUserName}</span>
              <span className="ml-2 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {currentUser.role}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            {isTeacherOrMdm ? 'Post announcement or discussion topic' : 'Ask a doubt or share discussion'}
          </span>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-3">
          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder={
              isTeacherOrMdm
                ? "Share an announcement, lesson topic, or prompt for this class..."
                : "Post a question, share an insight, or ask your teachers and classmates..."
            }
            rows={3}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
          />

          <div className="flex items-center justify-between flex-wrap gap-2">
            {isTeacherOrMdm ? (
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinChecked}
                  onChange={(e) => setIsPinChecked(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Pin className="w-3.5 h-3.5 text-amber-500" />
                <span>Pin to top as official announcement</span>
              </label>
            ) : (
              <span className="text-[11px] text-slate-400 italic">
                Visible to teachers, MDM observers, and classmates
              </span>
            )}

            <button
              type="submit"
              disabled={isSubmittingPost || !newPostText.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingPost ? 'Posting...' : 'Post Message'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Discussion Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No posts in this discussion group yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start the discussion by posting the first message or announcement above.
            </p>
          </div>
        ) : (
          posts.map((post, pIdx) => {
            const postKey = post.postId || (post as any).id || `post-${pIdx}`;
            return (
              <PostCard
                key={postKey}
                post={post}
                group={group}
                currentUser={currentUser}
                isRepliesExpanded={!!expandedReplies[postKey]}
                onToggleReplies={() => toggleRepliesVisibility(postKey)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// SUB-COMPONENT: Individual Post Card with Replies Thread
// ---------------------------------------------------------------------------

interface PostCardProps {
  post: DiscussionPostDoc;
  group: DiscussionGroupDoc;
  currentUser: {
    uid: string;
    name: string;
    role: 'mdm' | 'teacher' | 'student';
  };
  isRepliesExpanded: boolean;
  onToggleReplies: () => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  group,
  currentUser,
  isRepliesExpanded,
  onToggleReplies
}) => {
  const [replies, setReplies] = useState<DiscussionReplyDoc[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const isAuthor = currentUser.uid === post.createdBy;
  const isTeacherOrMdm = currentUser.role === 'teacher' || currentUser.role === 'mdm';
  const canModerate = isTeacherOrMdm || isAuthor;

  const authorName = (post.createdByName || (post as any)?.authorName || (post as any)?.name || (post as any)?.author || 'Member').trim() || 'Member';
  const authorInitial = authorName.charAt(0).toUpperCase() || 'M';
  const authorRole = post.createdByRole || (post as any)?.authorRole || (post as any)?.role || 'student';

  // Real-time replies listener
  useEffect(() => {
    const unsub = subscribeToPostReplies(group.groupId, post.postId, (data) => {
      setReplies(data);
    });
    return () => unsub();
  }, [group.groupId, post.postId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || post.status === 'closed') return;

    soundFx.playPop();
    setIsSubmittingReply(true);
    try {
      await createPostReply({
        groupId: group.groupId,
        postId: post.postId,
        message: replyInput.trim(),
        createdBy: currentUser.uid,
        createdByRole: currentUser.role,
        createdByName: (currentUser?.name || (currentUser as any)?.displayName || 'User').trim() || 'User'
      });
      setReplyInput('');
      soundFx.playSuccess();
    } catch (err) {
      console.error('Error submitting reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleTogglePin = async () => {
    soundFx.playClick();
    await togglePinDiscussionPost(group.groupId, post.postId, !post.pinned);
  };

  const handleClosePost = async () => {
    soundFx.playClick();
    await closeDiscussionPost(group.groupId, post.postId);
  };

  const handleDeletePost = async () => {
    soundFx.playClick();
    await deleteDiscussionPost(group.groupId, post.postId);
  };

  const formatPostDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' at ' +
             d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  // Role Badge Helper
  const renderRoleBadge = (role: string) => {
    if (role === 'mdm') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          MDM Officer
        </span>
      );
    }
    if (role === 'teacher') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
          <GraduationCap className="w-3 h-3" />
          Teacher
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        Student
      </span>
    );
  };

  return (
    <div className={`rounded-3xl bg-white dark:bg-slate-900 border transition shadow-sm ${
      post.pinned
        ? 'border-amber-400 dark:border-amber-600/70 bg-gradient-to-b from-amber-50/20 dark:from-amber-950/10 to-transparent'
        : 'border-slate-200 dark:border-slate-800'
    }`}>
      {/* Pinned Marker Banner */}
      {post.pinned && (
        <div className="px-5 py-2 bg-amber-100/70 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 rounded-t-3xl flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            <span>PINNED OFFICIAL ANNOUNCEMENT</span>
          </div>
          {isTeacherOrMdm && (
            <button
              onClick={handleTogglePin}
              className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
            >
              Unpin
            </button>
          )}
        </div>
      )}

      <div className="p-5 space-y-3">
        {/* Author Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${
              authorRole === 'mdm'
                ? 'bg-purple-600 text-white'
                : authorRole === 'teacher'
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 text-white'
            }`}>
              {authorInitial}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {authorName}
                </span>
                {renderRoleBadge(authorRole)}
                {post.status === 'closed' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Closed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{formatPostDate(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Teacher/MDM Post Controls */}
          {canModerate && (
            <div className="flex items-center gap-1">
              {isTeacherOrMdm && (
                <>
                  <button
                    onClick={handleTogglePin}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                    title={post.pinned ? "Unpin Post" : "Pin Post to Top"}
                  >
                    {post.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </button>
                  {post.status !== 'closed' && (
                    <button
                      onClick={handleClosePost}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Close Thread"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
              <button
                onClick={handleDeletePost}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                title="Delete Post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Post Message Body */}
        <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
          {post.message}
        </p>

        {/* Footer Actions: Toggle Replies & Reply Count */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <button
            onClick={onToggleReplies}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>
              {replies.length === 0
                ? 'Reply to thread'
                : `${replies.length} ${replies.length === 1 ? 'Reply' : 'Replies'}`}
            </span>
          </button>
          <span className="text-[10px] text-slate-400">
            Realtime Firestore Sync
          </span>
        </div>

        {/* Replies Section (Collapsible / Expandable) */}
        {isRepliesExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in">
            {/* Replies List */}
            {replies.length > 0 && (
              <div className="space-y-2.5 pl-3 border-l-2 border-slate-200 dark:border-slate-800">
                {replies.map((reply, rIdx) => {
                  const replyKey = reply.replyId || (reply as any)?.id || `${post.postId}-reply-${rIdx}`;
                  const replyAuthorName = (reply.createdByName || (reply as any)?.authorName || (reply as any)?.name || (reply as any)?.author || 'Member').trim() || 'Member';
                  const replyAuthorRole = reply.createdByRole || (reply as any)?.authorRole || 'student';
                  return (
                    <div
                      key={replyKey}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {replyAuthorName}
                          </span>
                          {renderRoleBadge(replyAuthorRole)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {formatPostDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {reply.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reply Composer */}
            {post.status === 'closed' ? (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-xs text-slate-500 text-center flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>This discussion thread has been closed by the instructor.</span>
              </div>
            ) : (
              <form onSubmit={handleSendReply} className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={`Reply to ${authorName}...`}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingReply || !replyInput.trim()}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
