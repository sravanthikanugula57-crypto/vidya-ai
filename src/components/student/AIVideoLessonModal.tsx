import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  HelpCircle,
  BookOpen,
  ArrowRight,
  RefreshCw,
  X,
  FastForward,
  Rewind,
  Share2,
  ThumbsUp,
  Award,
  ChevronRight,
  Compass,
  FileText
} from 'lucide-react';
import { AIVideoLesson, VideoScene } from '../../types/aiVideo';
import { AIVideoService } from '../../services/aiVideoService';
import confetti from 'canvas-confetti';

interface AIVideoLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: string;
  subject: string;
  subjectId: string;
  chapter: string;
  chapterId: string;
  topic: string;
  topicId: string;
  initialVideo?: AIVideoLesson | null;
}

export const AIVideoLessonModal: React.FC<AIVideoLessonModalProps> = ({
  isOpen,
  onClose,
  grade,
  subject,
  subjectId,
  chapter,
  chapterId,
  topic,
  topicId,
  initialVideo = null
}) => {
  const [videoLesson, setVideoLesson] = useState<AIVideoLesson | null>(initialVideo);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStageMessage, setCurrentStageMessage] = useState('Initializing AI Video Pipeline...');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'te' | 'hi'>('en');

  // Video playback state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState<'storyboard' | 'quiz' | 'practice' | 'notes'>('storyboard');
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResult, setShowQuizResult] = useState<Record<string, boolean>>({});
  const [isLiked, setIsLiked] = useState(false);

  // Check for existing video on open
  useEffect(() => {
    if (isOpen) {
      if (initialVideo) {
        setVideoLesson(initialVideo);
        setIsGenerating(false);
      } else {
        // Look up in cache / DB
        AIVideoService.getExistingVideoForTopic(grade, subjectId, chapterId, topicId).then((existing) => {
          if (existing) {
            setVideoLesson(existing);
            setIsGenerating(false);
          } else {
            // Auto start generation if none exists
            handleStartGeneration();
          }
        });
      }
    }
  }, [isOpen, topicId, initialVideo]);

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationProgress(5);
    setCurrentStageMessage('Connecting to Vidya AI Video Synthesizer...');

    try {
      const generated = await AIVideoService.generateLessonVideo({
        grade,
        subject,
        subjectId,
        chapter,
        chapterId,
        topic,
        topicId,
        language,
        onStatusUpdate: (stage, progress, message) => {
          setGenerationProgress(progress);
          setCurrentStageMessage(message);
        }
      });

      setVideoLesson(generated);
      setIsGenerating(false);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } catch (err: any) {
      console.error('Video generation failed:', err);
      setGenerationError(err.message || 'Failed to generate video lesson. Please try again.');
      setIsGenerating(false);
    }
  };

  // Video Controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipSeconds = (delta: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const jumpToScene = (sceneIndex: number) => {
    if (!videoLesson || !videoRef.current) return;
    let targetTime = 0;
    for (let i = 0; i < sceneIndex; i++) {
      targetTime += videoLesson.scenes[i]?.durationSeconds || 7;
    }
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleQuizSelect = (quizId: string, optionIdx: number) => {
    setSelectedQuizAnswers(prev => ({ ...prev, [quizId]: optionIdx }));
    setShowQuizResult(prev => ({ ...prev, [quizId]: true }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-6xl max-h-[96vh] flex flex-col bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {grade}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {subject}
                  </span>
                  <span className="text-xs text-slate-400">
                    {chapter}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                  AI Lesson: {topic}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('te')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    language === 'te' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  తెలుగు (Telugu)
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {isGenerating ? (
              // GENERATION SCREEN (Real-time pipeline stage visualizer)
              <div className="py-12 px-4 max-w-2xl mx-auto text-center">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                  <div className="absolute inset-3 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">
                  Synthesizing Educational AI Video
                </h3>
                <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto">
                  Generating chapter-aware pedagogical storyboard, animated chalkboard models, and teacher narration for <span className="text-blue-400 font-semibold">{topic}</span>.
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-3 mb-3 overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-8">
                  <span className="text-blue-400">{currentStageMessage}</span>
                  <span className="text-emerald-400 font-mono">{generationProgress}%</span>
                </div>

                {/* Pipeline Stages Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto">
                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                    generationProgress >= 25 ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-slate-800/40 border-slate-800 text-slate-500'
                  }`}>
                    <CheckCircle2 className={`w-5 h-5 ${generationProgress >= 25 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className="text-xs font-medium">1. SCERT Pedagogical Storyboard</span>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                    generationProgress >= 50 ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-slate-800/40 border-slate-800 text-slate-500'
                  }`}>
                    <CheckCircle2 className={`w-5 h-5 ${generationProgress >= 50 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className="text-xs font-medium">2. Teacher Voice & Audio Track</span>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                    generationProgress >= 75 ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-slate-800/40 border-slate-800 text-slate-500'
                  }`}>
                    <CheckCircle2 className={`w-5 h-5 ${generationProgress >= 75 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className="text-xs font-medium">3. Animated Chalkboard & Visuals</span>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                    generationProgress >= 95 ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-slate-800/40 border-slate-800 text-slate-500'
                  }`}>
                    <CheckCircle2 className={`w-5 h-5 ${generationProgress >= 95 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className="text-xs font-medium">4. Real MP4 Video Assembly</span>
                  </div>
                </div>
              </div>
            ) : generationError ? (
              // ERROR STATE
              <div className="py-16 text-center max-w-md mx-auto">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Generation Failed</h3>
                <p className="text-sm text-slate-400 mb-6">{generationError}</p>
                <button
                  onClick={handleStartGeneration}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Generation
                </button>
              </div>
            ) : videoLesson ? (
              // VIDEO PLAYER & LEARNING DASHBOARD
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Video Player & Controls */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group">
                    <video
                      ref={videoRef}
                      src={videoLesson.videoUrl}
                      className="w-full h-full object-contain"
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={() => setIsPlaying(false)}
                      onClick={togglePlay}
                      playsInline
                    />

                    {/* Overlay Play Button when paused */}
                    {!isPlaying && (
                      <div
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 ml-1" />
                        </div>
                      </div>
                    )}

                    {/* Video Player Floating Bottom Controls */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-4 flex flex-col gap-2 opacity-95 transition-opacity">
                      {/* Timeline Seek Bar */}
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />

                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={togglePlay}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                          >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </button>

                          <button
                            onClick={() => skipSeconds(-5)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                            title="Rewind 5s"
                          >
                            <Rewind className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => skipSeconds(5)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                            title="Forward 5s"
                          >
                            <FastForward className="w-4 h-4" />
                          </button>

                          <span className="font-mono text-xs text-slate-400">
                            {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Speed Menu */}
                          <div className="flex items-center bg-slate-800/80 rounded-md px-2 py-0.5 border border-slate-700 text-xs">
                            {[1, 1.25, 1.5].map((spd) => (
                              <button
                                key={spd}
                                onClick={() => handleSpeedChange(spd)}
                                className={`px-1.5 py-0.5 rounded ${
                                  playbackSpeed === spd ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {spd}x
                              </button>
                            ))}
                          </div>

                          <a
                            href={videoLesson.videoUrl}
                            download={`${grade}_${subject}_${topic}.mp4`}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
                            title="Download MP4 Video"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Video Metadata & Actions */}
                  <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {videoLesson.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {videoLesson.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsLiked(!isLiked)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                            isLiked
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{isLiked ? 'Helpful (2)' : 'Helpful'}</span>
                        </button>
                        <button
                          onClick={handleStartGeneration}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-semibold transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Regenerate</span>
                        </button>
                      </div>
                    </div>

                    {/* Key Takeaways */}
                    <div className="mt-4 pt-4 border-t border-slate-700/60">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        Core Chapter Takeaways
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {videoLesson.keyTakeaways?.map((takeaway, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{takeaway}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Interactive Storyboard, Quiz & Practice Tabs */}
                <div className="flex flex-col gap-4">
                  {/* Tab Navigation */}
                  <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700 text-xs font-semibold">
                    <button
                      onClick={() => setActiveTab('storyboard')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                        activeTab === 'storyboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Scenes ({videoLesson.scenes.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                        activeTab === 'quiz' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Quiz ({videoLesson.interactiveQuiz?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('practice')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                        activeTab === 'practice' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Practice
                    </button>
                  </div>

                  {/* Tab Content Box */}
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 flex-1 overflow-y-auto max-h-[500px]">
                    {activeTab === 'storyboard' && (
                      <div className="flex flex-col gap-3">
                        <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
                          <span>Chapter Scene Timeline</span>
                          <span>Click scene to jump video</span>
                        </div>
                        {videoLesson.scenes.map((scene, idx) => (
                          <div
                            key={scene.id}
                            onClick={() => jumpToScene(idx)}
                            className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl cursor-pointer transition-all group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-blue-400 group-hover:text-blue-300">
                                {scene.title}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                {scene.durationSeconds}s
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                              {scene.narration}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'quiz' && (
                      <div className="flex flex-col gap-4">
                        <div className="text-xs font-semibold text-slate-400 mb-1">
                          Test Your Understanding
                        </div>
                        {videoLesson.interactiveQuiz?.map((quiz, qIdx) => {
                          const selectedOpt = selectedQuizAnswers[quiz.id];
                          const isAnswered = showQuizResult[quiz.id];

                          return (
                            <div key={quiz.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                              <p className="text-xs font-bold text-white mb-3">
                                {qIdx + 1}. {quiz.question}
                              </p>
                              <div className="flex flex-col gap-2">
                                {quiz.options.map((opt, optIdx) => {
                                  let btnStyle = 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-300';
                                  if (isAnswered) {
                                    if (optIdx === quiz.correctIndex) {
                                      btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
                                    } else if (selectedOpt === optIdx) {
                                      btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-300';
                                    }
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => handleQuizSelect(quiz.id, optIdx)}
                                      className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${btnStyle}`}
                                    >
                                      <span>{opt}</span>
                                      {isAnswered && optIdx === quiz.correctIndex && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {isAnswered && (
                                <div className="mt-3 p-2.5 bg-blue-950/30 border border-blue-800/40 rounded-lg text-xs text-blue-300 leading-relaxed">
                                  <span className="font-bold">Explanation:</span> {quiz.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {activeTab === 'practice' && (
                      <div className="flex flex-col gap-4">
                        <div className="text-xs font-semibold text-slate-400 mb-1">
                          Exam Step-by-Step Solutions
                        </div>
                        {videoLesson.practiceQuestions?.map((practice, pIdx) => (
                          <div key={practice.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-emerald-400">
                                Question {pIdx + 1}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                {practice.difficulty}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-white mb-3">
                              {practice.question}
                            </p>
                            <div className="space-y-1.5 mb-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Step-by-Step Solution:
                              </div>
                              {practice.solutionSteps.map((step, sIdx) => (
                                <div key={sIdx} className="text-xs text-slate-300 pl-2 border-l-2 border-blue-500">
                                  {step}
                                </div>
                              ))}
                            </div>
                            <div className="text-xs font-bold text-emerald-300">
                              Final Answer: {practice.finalAnswer}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
