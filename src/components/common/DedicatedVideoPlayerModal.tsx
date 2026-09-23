import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  Maximize,
  Clock,
  CheckCircle2,
  User,
  BookOpen,
  Sparkles,
  Download,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Bot,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Film,
  FileText,
  Subtitles,
  ExternalLink,
  Award
} from 'lucide-react';
import { formatYouTubeEmbedUrl, extractYouTubeId, isYouTubeUrl, getYouTubeWatchUrl } from '../../lib/videoUtils';
import { soundFx } from '../../lib/audio';
import {
  saveVideoWatchProgress,
  subscribeToVideoWatchProgress,
  VideoWatchProgressDoc
} from '../../services/studentFirestoreService';

export interface DedicatedVideoItem {
  id?: string;
  title: string;
  description?: string;
  videoUrl?: string;
  fileUrl?: string;
  youtubeLink?: string;
  mp4Url?: string;
  subject?: string;
  chapter?: string;
  lessonName?: string;
  teacherName?: string;
  teacher?: string;
  duration?: string;
  durationSeconds?: number;
  uploadedAt?: string;
  thumbnail?: string;
  notesUrl?: string;
}

interface DedicatedVideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: DedicatedVideoItem | null;
  allLessons?: DedicatedVideoItem[];
  userId?: string;
  onMarkCompleted?: () => void;
  isCompleted?: boolean;
}

export const DedicatedVideoPlayerModal: React.FC<DedicatedVideoPlayerModalProps> = ({
  isOpen,
  onClose,
  video: initialVideo,
  allLessons = [],
  userId = 'std_101',
  onMarkCompleted,
  isCompleted: initialCompleted = false
}) => {
  const [currentVideo, setCurrentVideo] = useState<DedicatedVideoItem | null>(initialVideo);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(true);
  const [showResumedToast, setShowResumedToast] = useState<boolean>(false);
  const [isCompletedState, setIsCompletedState] = useState<boolean>(initialCompleted);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showAiDoubt, setShowAiDoubt] = useState<boolean>(false);
  const [aiChatInput, setAiChatInput] = useState<string>('');
  const [aiMessages, setAiMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([]);
  const [notesDownloaded, setNotesDownloaded] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentVideo(initialVideo);
    setIsCompletedState(initialCompleted);
  }, [initialVideo, initialCompleted]);

  const videoId = currentVideo?.id || currentVideo?.title.toLowerCase().replace(/\s+/g, '_') || 'vid_101';

  // Real-time subscribe to saved watch progress from Firestore
  useEffect(() => {
    if (!isOpen || !userId || !videoId) return;

    const unsub = subscribeToVideoWatchProgress(userId, videoId, (prog) => {
      if (prog) {
        if (prog.completed) setIsCompletedState(true);
        if (prog.bookmarked) setIsBookmarked(true);
        if (prog.positionSeconds > 5 && videoRef.current && Math.abs(videoRef.current.currentTime - prog.positionSeconds) > 5) {
          videoRef.current.currentTime = prog.positionSeconds;
          setCurrentTime(prog.positionSeconds);
          setShowResumedToast(true);
          setTimeout(() => setShowResumedToast(false), 3000);
        }
      }
    });

    return () => unsub();
  }, [isOpen, userId, videoId]);

  // Initial welcome message for AI Doubt Chat
  useEffect(() => {
    if (currentVideo) {
      setAiMessages([
        {
          sender: 'ai',
          text: `Hello! I am Vidya AI Tutor. Ask me anything about "${currentVideo.title}" (${currentVideo.subject || 'Class 10'})!`,
          time: 'Just now'
        }
      ]);
    }
  }, [currentVideo]);

  if (!isOpen || !currentVideo) return null;

  const rawUrl = currentVideo.videoUrl || currentVideo.fileUrl || currentVideo.youtubeLink || currentVideo.mp4Url || '';
  const isYoutube = isYouTubeUrl(rawUrl) || extractYouTubeId(rawUrl).length > 0;
  const embedUrl = isYoutube ? formatYouTubeEmbedUrl(rawUrl) : rawUrl;
  const directWatchUrl = isYoutube ? getYouTubeWatchUrl(rawUrl) : (rawUrl.startsWith('http') ? rawUrl : embedUrl);

  // Find index in playlist
  const currentIndex = allLessons.findIndex(
    (l) => (l.id && l.id === currentVideo.id) || l.title === currentVideo.title
  );
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handlePlayPause = () => {
    soundFx.playClick();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setCurrentTime(cur);
    setDuration(dur);

    // Save watch progress to Firestore periodically (every 5s)
    if (Math.floor(cur) % 5 === 0) {
      saveVideoWatchProgress(userId, videoId, {
        title: currentVideo.title,
        subject: currentVideo.subject,
        chapter: currentVideo.chapter,
        lessonName: currentVideo.lessonName,
        positionSeconds: cur,
        durationSeconds: dur,
        completed: isCompletedState,
        bookmarked: isBookmarked
      });
    }
  };

  const handleVideoEnded = async () => {
    soundFx.playSuccess();
    setIsPlaying(false);
    setIsCompletedState(true);

    await saveVideoWatchProgress(userId, videoId, {
      title: currentVideo.title,
      subject: currentVideo.subject,
      chapter: currentVideo.chapter,
      lessonName: currentVideo.lessonName,
      positionSeconds: duration,
      durationSeconds: duration,
      completed: true,
      bookmarked: isBookmarked
    });

    if (onMarkCompleted) {
      onMarkCompleted();
    }
  };

  const handleSpeedChange = (speed: number) => {
    soundFx.playClick();
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const handleToggleFullscreen = () => {
    soundFx.playPop();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.warn(err));
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
    }
  };

  const handleTogglePiP = async () => {
    soundFx.playPop();
    if (videoRef.current && document.pictureInPictureEnabled) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    }
  };

  const handleToggleComplete = async () => {
    soundFx.playSuccess();
    const nextVal = !isCompletedState;
    setIsCompletedState(nextVal);

    await saveVideoWatchProgress(userId, videoId, {
      title: currentVideo.title,
      subject: currentVideo.subject,
      chapter: currentVideo.chapter,
      lessonName: currentVideo.lessonName,
      positionSeconds: currentTime,
      durationSeconds: duration,
      completed: nextVal,
      bookmarked: isBookmarked
    });

    if (onMarkCompleted) {
      onMarkCompleted();
    }
  };

  const handleToggleBookmark = async () => {
    soundFx.playCheck();
    const nextVal = !isBookmarked;
    setIsBookmarked(nextVal);

    await saveVideoWatchProgress(userId, videoId, {
      title: currentVideo.title,
      subject: currentVideo.subject,
      chapter: currentVideo.chapter,
      lessonName: currentVideo.lessonName,
      positionSeconds: currentTime,
      durationSeconds: duration,
      completed: isCompletedState,
      bookmarked: nextVal
    });
  };

  const handleDownloadNotes = () => {
    soundFx.playSuccess();
    setNotesDownloaded(true);
    setTimeout(() => setNotesDownloaded(false), 3000);

    const dummyText = `=================================================\nCLASS 10 ${currentVideo.subject || 'BOARD'} STUDY NOTES\n=================================================\nLesson: ${currentVideo.title}\nChapter: ${currentVideo.chapter || 'Syllabus Chapter'}\nTeacher: ${currentVideo.teacherName || currentVideo.teacher || 'Vidya AI Master Teacher'}\n\nKey Concepts & Formula Summary:\n1. Master the definitions and core proofs explained in this video lesson.\n2. Review board exam 5-mark diagram questions step by step.\n3. Practice Exercise Questions and Previous Year Board Questions (PYQs).\n\nDownloaded from Vidya AI Platform.`;
    const blob = new Blob([dummyText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentVideo.title.replace(/\s+/g, '_')}_Notes.txt`;
    a.click();
  };

  const handleSendAiDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    soundFx.playClick();
    const query = aiChatInput.trim();
    setAiChatInput('');
    setAiMessages((prev) => [...prev, { sender: 'user', text: query, time: 'Just now' }]);

    setTimeout(() => {
      const reply = `For "${currentVideo.title}": Great question about "${query}". In Class 10 ${currentVideo.subject || 'Syllabus'}, remember to clearly write out steps, formulas, and state-board diagram labels for full 5-mark evaluation!`;
      setAiMessages((prev) => [...prev, { sender: 'ai', text: reply, time: 'Just now' }]);
    }, 600);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
        <motion.div
          ref={containerRef}
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col my-auto"
        >
          {/* TOP HEADER */}
          <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                <Film className="w-5 h-5 text-purple-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-purple-400 tracking-wider">
                  <span>{currentVideo.subject || 'Class 10 Video'}</span>
                  <span>•</span>
                  <span>{currentVideo.chapter || 'SCERT Chapter'}</span>
                </div>
                <h2 className="text-sm sm:text-base font-black text-white truncate">{currentVideo.title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleBookmark}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Bookmark Lesson"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN TWO-COLUMN BODY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {/* LEFT / MAIN COLUMN: VIDEO PLAYER & METADATA */}
            <div className="lg:col-span-8 flex flex-col bg-black">
              {/* VIDEO PLAYER CONTAINER */}
              <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center border-b border-slate-800 group">
                {showResumedToast && (
                  <div className="absolute top-4 left-4 z-30 px-3.5 py-1.5 rounded-xl bg-purple-600/90 text-white text-xs font-black shadow-lg backdrop-blur flex items-center gap-1.5 animate-bounce">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Auto Resumed from {formatTime(currentTime)}</span>
                  </div>
                )}

                {isYoutube ? (
                  <iframe
                    src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1&rel=0&enablejsapi=1`}
                    title={currentVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={rawUrl}
                    controls={false}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnded}
                    className="w-full h-full object-contain"
                  />
                )}

                {/* CUSTOM MP4 PLAYER CONTROLS OVERLAY */}
                {!isYoutube && (
                  <div className="absolute inset-x-0 bottom-0 z-20 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* SEEK BAR */}
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 accent-purple-500 bg-slate-700 rounded-lg cursor-pointer"
                    />

                    <div className="flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePlayPause}
                          className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                        </button>

                        <span className="font-mono text-[11px] text-slate-300">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Speed dropdown */}
                        <select
                          value={playbackSpeed}
                          onChange={(e) => handleSpeedChange(Number(e.target.value))}
                          className="px-2 py-0.5 rounded bg-slate-800 text-white text-[11px] font-bold border border-slate-700"
                        >
                          <option value={0.5}>0.5x</option>
                          <option value={0.75}>0.75x</option>
                          <option value={1.0}>1.0x Speed</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2.0}>2.0x</option>
                        </select>

                        {/* PiP */}
                        <button
                          onClick={handleTogglePiP}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Picture-in-Picture"
                        >
                          <Film className="w-3.5 h-3.5" />
                        </button>

                        {/* Fullscreen */}
                        <button
                          onClick={handleToggleFullscreen}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Fullscreen"
                        >
                          <Maximize className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* VIDEO DETAILS BELOW PLAYER */}
              <div className="p-5 sm:p-6 bg-slate-900 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-3 flex-wrap">
                    {(currentVideo.teacher || currentVideo.teacherName) && (
                      <span className="flex items-center gap-1.5 font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/80">
                        <User className="w-3.5 h-3.5 text-purple-400" />
                        <span>Teacher: {currentVideo.teacher || currentVideo.teacherName}</span>
                      </span>
                    )}

                    {currentVideo.duration && (
                      <span className="flex items-center gap-1.5 font-bold text-slate-400 bg-slate-800/60 px-2.5 py-1.5 rounded-xl">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Duration: {currentVideo.duration}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {directWatchUrl && (
                      <a
                        href={directWatchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Open Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={handleToggleComplete}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                        isCompletedState
                          ? 'bg-emerald-600 text-white'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isCompletedState ? 'Lesson Completed' : 'Mark as Completed (+25 XP)'}</span>
                    </button>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">Lesson Overview & Objectives</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentVideo.description ||
                      `Detailed video lesson covering key Class 10 concepts for ${currentVideo.title}. Designed strictly for Andhra Pradesh & Telangana SCERT State Board exam success.`}
                  </p>
                </div>

                {/* ACTIONS TOOLBAR */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <button
                    onClick={handleDownloadNotes}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-sky-400" />
                    <span>{notesDownloaded ? 'Downloaded Notes!' : 'Download Notes'}</span>
                  </button>

                  <button
                    onClick={() => setShowAiDoubt(!showAiDoubt)}
                    className="p-3 rounded-2xl bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 border border-purple-700/50 text-white text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>{showAiDoubt ? 'Hide AI Doubt' : 'Ask AI About Lesson'}</span>
                  </button>

                  <button
                    onClick={handleToggleBookmark}
                    className={`col-span-2 sm:col-span-1 p-3 rounded-2xl border text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
                      isBookmarked
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span>{isBookmarked ? 'Bookmarked' : 'Bookmark Lesson'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: AI DOUBT CHAT & RELATED LESSONS PLAYLIST */}
            <div className="lg:col-span-4 p-5 bg-slate-900/90 flex flex-col justify-between space-y-6">
              {/* AI DOUBT CHAT OR RELATED LESSONS */}
              {showAiDoubt ? (
                <div className="space-y-4 flex flex-col h-full">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <span>Vidya AI Lesson Assistant</span>
                    </div>
                    <button
                      onClick={() => setShowAiDoubt(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  <div className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                    {aiMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-2xl max-w-[88%] ${
                          msg.sender === 'user'
                            ? 'bg-purple-600 text-white ml-auto'
                            : 'bg-slate-800 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <span className="text-[9px] text-slate-400 block mt-1">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendAiDoubt} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      placeholder="Ask any question about this video..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* PREVIOUS & NEXT LESSON NAV BUTTONS */}
                  <div className="flex items-center gap-2">
                    {prevLesson && (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setCurrentVideo(prevLesson);
                        }}
                        className="flex-1 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="truncate">Prev: {prevLesson.title}</span>
                      </button>
                    )}

                    {nextLesson && (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setCurrentVideo(nextLesson);
                        }}
                        className="flex-1 p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer shadow-md"
                      >
                        <span className="truncate">Next: {nextLesson.title}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* RELATED LESSONS PLAYLIST */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                      <span>Chapter Lessons ({allLessons.length > 0 ? allLessons.length : 1})</span>
                      <span className="text-[10px] text-purple-400">Class 10 Syllabus</span>
                    </h3>

                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {(allLessons.length > 0 ? allLessons : [currentVideo]).map((item, idx) => {
                        const isActive = item.title === currentVideo.title;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              soundFx.playClick();
                              setCurrentVideo(item);
                            }}
                            className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                              isActive
                                ? 'bg-purple-950/60 border-purple-500/80 text-white'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] text-purple-400 font-bold block">Lesson {idx + 1}</span>
                              <h4 className="text-xs font-black truncate">{item.title}</h4>
                              <p className="text-[10px] text-slate-400 font-medium">{item.duration || '20 Mins'}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER SYNC STATUS */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <Award className="w-3.5 h-3.5" />
                  <span>Real-time Watch Position Saved</span>
                </span>
                <span>AP/TS Board</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
