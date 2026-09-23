import { VideoScene, VisualSceneType } from '../types/aiVideo';

/**
 * Generates an actual playable MP4 / WebM video file from structured educational scenes.
 * Uses HTML5 Canvas 2D frame rendering + Web Audio / Web Speech API + MediaRecorder
 * to produce a genuine video binary that can be streamed, scrubbed, and downloaded!
 */
export async function generateEducationalVideoBinary(
  scenes: VideoScene[],
  onProgress?: (progress: number, message: string) => void
): Promise<{ blob: Blob; blobUrl: string; streamUrl?: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    try {
      const width = 1280;
      const height = 720;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // Check supported MIME types for MediaRecorder
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4';
          }
        }
      }

      // Create audio context for synthesizer sound & voice
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const audioDest = audioCtx.createMediaStreamDestination();

      // Create video stream from canvas
      const canvasStream = canvas.captureStream(30); // 30 fps
      const combinedTracks = [
        ...canvasStream.getVideoTracks(),
        ...audioDest.stream.getAudioTracks()
      ];
      const combinedStream = new MediaStream(combinedTracks);

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
        videoBitsPerSecond: 2500000 // 2.5 Mbps crisp 720p HD
      });

      const recordedChunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const finalBlob = new Blob(recordedChunks, { type: mimeType });
          const blobUrl = URL.createObjectURL(finalBlob);

          // Upload to server storage endpoint for permanent streaming link
          let streamUrl: string | undefined = undefined;
          try {
            const reader = new FileReader();
            reader.readAsDataURL(finalBlob);
            reader.onloadend = async () => {
              try {
                const base64Data = reader.result as string;
                const videoId = 'vid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
                const res = await fetch('/api/ai/video-storage/save', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ videoId, base64Data, mimeType })
                });
                if (res.ok) {
                  const data = await res.json();
                  streamUrl = data.streamUrl;
                }
                resolve({ blob: finalBlob, blobUrl, streamUrl, mimeType });
              } catch {
                resolve({ blob: finalBlob, blobUrl, streamUrl: blobUrl, mimeType });
              }
            };
          } catch {
            resolve({ blob: finalBlob, blobUrl, streamUrl: blobUrl, mimeType });
          }
        } catch (err) {
          reject(err);
        }
      };

      recorder.start(100); // chunk every 100ms

      // Audio beeps for transitions
      function playTransitionTone(time: number, freq: number = 520) {
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          gain.gain.setValueAtTime(0.08, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
          osc.connect(gain);
          gain.connect(audioDest);
          osc.start(time);
          osc.stop(time + 0.3);
        } catch (e) {
          // ignore audio context errors
        }
      }

      // Voiceover synthesizer via Web Speech API (with fallback timer)
      function speakNarration(text: string): Promise<void> {
        return new Promise((done) => {
          if (!('speechSynthesis' in window)) {
            setTimeout(done, 4000);
            return;
          }
          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.05;

            // Pick a good clear voice if available
            const voices = window.speechSynthesis.getVoices() || [];
            const preferredVoice = voices.find(v => v?.lang?.startsWith('en') && (
              (v.name || '').includes('Google') || 
              (v.name || '').includes('Natural') || 
              (v.name || '').includes('Samantha') || 
              (v.name || '').includes('India')
            )) || voices[0];
            if (preferredVoice) {
              utterance.voice = preferredVoice;
            }

            let finished = false;
            utterance.onend = () => {
              if (!finished) {
                finished = true;
                done();
              }
            };
            utterance.onerror = () => {
              if (!finished) {
                finished = true;
                done();
              }
            };

            // Fallback timer if speech synthesis stalls
            setTimeout(() => {
              if (!finished) {
                finished = true;
                done();
              }
            }, 7500);

            window.speechSynthesis.speak(utterance);
          } catch {
            setTimeout(done, 4000);
          }
        });
      }

      // Drawing function for chalkboard frames
      function renderSceneFrame(scene: VideoScene, sceneProgress: number, overallProgress: number) {
        // 1. Chalkboard Gradient Background
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.5, '#1e293b');
        bgGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Subtle blackboard grid dots
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let x = 40; x < width; x += 40) {
          for (let y = 40; y < height; y += 40) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 2. Top Header Bar (Vidya AI Masterclass branding)
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, 68);

        // Header Accent line
        const headerAccent = ctx.createLinearGradient(0, 66, width, 68);
        headerAccent.addColorStop(0, '#3b82f6');
        headerAccent.addColorStop(0.5, '#10b981');
        headerAccent.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = headerAccent;
        ctx.fillRect(0, 66, width, 3);

        // Logo & Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
        ctx.fillText('✨ VIDYA AI', 40, 42);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 16px system-ui, -apple-system, sans-serif';
        ctx.fillText('•   SCERT Smart Classroom HD Lesson', 180, 42);

        // Scene Badge Pill (Right)
        const sceneBadgeText = `Scene ${scene.sceneNumber} / ${scenes.length}`;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        roundRect(ctx, width - 180, 18, 140, 32, 16);
        ctx.fill();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText(sceneBadgeText, width - 165, 39);

        // 3. Main Stage Content Area
        const vData: Partial<VideoScene['visualData']> = scene.visualData || {};
        const vType: VisualSceneType = scene.visualType || 'concept_intro';

        // Stage Title & Subtitle
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 36px system-ui, sans-serif';
        ctx.fillText(vData.headline || scene.title, 60, 125);

        if (vData.subheading) {
          ctx.fillStyle = '#38bdf8';
          ctx.font = '600 18px system-ui, sans-serif';
          ctx.fillText(vData.subheading, 60, 155);
        }

        // Draw Visual Diagrams depending on visualType
        if (vType === 'fraction_pizza' || vType === 'diagram') {
          drawFractionPizzaVisual(ctx, vData, sceneProgress);
        } else if (vType === 'fraction_bar') {
          drawFractionBarVisual(ctx, vData, sceneProgress);
        } else if (vType === 'steps') {
          drawStepsVisual(ctx, vData, sceneProgress);
        } else if (vType === 'mistake_alert') {
          drawMistakeAlertVisual(ctx, vData, sceneProgress);
        } else if (vType === 'real_world') {
          drawRealWorldVisual(ctx, vData, sceneProgress);
        } else if (vType === 'recap') {
          drawRecapVisual(ctx, vData, sceneProgress);
        } else {
          drawFormulaConceptVisual(ctx, vData, sceneProgress);
        }

        // 4. Bottom Subtitle / Closed Caption Bar
        const captionHeight = 85;
        const captionY = height - captionHeight - 16;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        roundRect(ctx, 40, captionY, width - 80, captionHeight, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Caption Audio Icon
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillText('🔊 Teacher Narration:', 65, captionY + 30);

        // Caption text wrapped
        ctx.fillStyle = '#ffffff';
        ctx.font = '500 18px system-ui, sans-serif';
        const captionText = scene.caption || scene.narration.substring(0, 110);
        ctx.fillText(captionText, 65, captionY + 60);

        // 5. Video Progress Bar at the very bottom
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(0, height - 6, width, 6);

        const currentBarWidth = width * overallProgress;
        const progGrad = ctx.createLinearGradient(0, 0, width, 0);
        progGrad.addColorStop(0, '#3b82f6');
        progGrad.addColorStop(0.5, '#10b981');
        progGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = progGrad;
        ctx.fillRect(0, height - 6, currentBarWidth, 6);
      }

      // Custom Visual Renderers:
      // A. Fraction Pizza Renderer (Circular Pie with animated slices)
      function drawFractionPizzaVisual(context: CanvasRenderingContext2D, data: any, progress: number) {
        const num = data.fractionNumerator || 3;
        const den = data.fractionDenominator || 4;
        const centerX = 340;
        const centerY = 370;
        const radius = 150;

        // Draw circular plate shadow
        context.beginPath();
        context.arc(centerX, centerY, radius + 14, 0, Math.PI * 2);
        context.fillStyle = 'rgba(0, 0, 0, 0.35)';
        context.fill();

        // Draw circular pizza crust
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.fillStyle = '#b45309';
        context.fill();
        context.strokeStyle = '#d97706';
        context.lineWidth = 6;
        context.stroke();

        // Inner sauce
        context.beginPath();
        context.arc(centerX, centerY, radius - 10, 0, Math.PI * 2);
        context.fillStyle = '#dc2626';
        context.fill();

        // Draw wedges
        const anglePerWedge = (Math.PI * 2) / den;
        for (let i = 0; i < den; i++) {
          const startAngle = i * anglePerWedge - Math.PI / 2;
          const endAngle = startAngle + anglePerWedge;
          const isFilled = i < num;

          context.beginPath();
          context.moveTo(centerX, centerY);
          context.arc(centerX, centerY, radius - 12, startAngle, endAngle);
          context.closePath();

          if (isFilled) {
            // Golden cheese with animated opacity
            const alpha = Math.min(1, progress * 1.5);
            context.fillStyle = `rgba(251, 191, 36, ${alpha})`;
            context.fill();

            // Toppings (pepperoni / basil dots)
            const midAngle = startAngle + anglePerWedge / 2;
            const dotX = centerX + Math.cos(midAngle) * (radius * 0.55);
            const dotY = centerY + Math.sin(midAngle) * (radius * 0.55);
            context.beginPath();
            context.arc(dotX, dotY, 10, 0, Math.PI * 2);
            context.fillStyle = '#991b1b';
            context.fill();
          } else {
            // Empty plate slice
            context.fillStyle = 'rgba(30, 41, 59, 0.7)';
            context.fill();
          }

          context.strokeStyle = '#78350f';
          context.lineWidth = 3;
          context.stroke();
        }

        // Right side info card
        const cardX = 580;
        const cardY = 200;
        const cardW = 640;
        const cardH = 340;

        context.fillStyle = 'rgba(30, 41, 59, 0.75)';
        roundRect(context, cardX, cardY, cardW, cardH, 20);
        context.fill();
        context.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        context.lineWidth = 2;
        context.stroke();

        // Big fraction badge
        context.fillStyle = '#10b981';
        context.font = 'bold 64px system-ui, sans-serif';
        context.fillText(`${num}`, cardX + 50, cardY + 110);
        context.fillRect(cardX + 45, cardY + 125, 60, 6);
        context.fillText(`${den}`, cardX + 50, cardY + 200);

        context.fillStyle = '#f8fafc';
        context.font = 'bold 24px system-ui, sans-serif';
        context.fillText(`Proper Fraction: ${num}/${den}`, cardX + 140, cardY + 80);

        context.fillStyle = '#94a3b8';
        context.font = '500 18px system-ui, sans-serif';
        context.fillText(`• Numerator (${num}) = Yellow shaded slices taken`, cardX + 140, cardY + 130);
        context.fillText(`• Denominator (${den}) = Total equal slices in whole`, cardX + 140, cardY + 170);
        context.fillText(`• Value = ${(num / den).toFixed(2)} (Strictly Less than 1 Whole!)`, cardX + 140, cardY + 210);

        // Highlight tag
        context.fillStyle = 'rgba(16, 185, 129, 0.2)';
        roundRect(context, cardX + 140, cardY + 250, 400, 46, 12);
        context.fill();
        context.strokeStyle = '#10b981';
        context.lineWidth = 1.5;
        context.stroke();
        context.fillStyle = '#34d399';
        context.font = 'bold 16px system-ui, sans-serif';
        context.fillText('✓ Top < Bottom  ⇒  Proper Fraction', cardX + 160, cardY + 280);
      }

      // B. Fraction Bar Renderer (Rectangular strip)
      function drawFractionBarVisual(context: CanvasRenderingContext2D, data: any, progress: number) {
        const num = data.fractionNumerator || 3;
        const den = data.fractionDenominator || 5;

        // Big Bar
        const barX = 100;
        const barY = 220;
        const barW = 1080;
        const barH = 100;

        context.fillStyle = 'rgba(15, 23, 42, 0.9)';
        roundRect(context, barX, barY, barW, barH, 16);
        context.fill();
        context.strokeStyle = '#38bdf8';
        context.lineWidth = 3;
        context.stroke();

        const segmentW = barW / den;
        for (let i = 0; i < den; i++) {
          const segX = barX + i * segmentW;
          const isFilled = i < num;

          if (isFilled) {
            context.fillStyle = '#3b82f6';
            roundRect(context, segX + 4, barY + 4, segmentW - 8, barH - 8, 10);
            context.fill();

            context.fillStyle = '#ffffff';
            context.font = 'bold 22px system-ui, sans-serif';
            context.fillText(`1/${den}`, segX + segmentW / 2 - 20, barY + 58);
          } else {
            context.fillStyle = 'rgba(255, 255, 255, 0.05)';
            roundRect(context, segX + 4, barY + 4, segmentW - 8, barH - 8, 10);
            context.fill();

            context.fillStyle = '#64748b';
            context.font = '500 20px system-ui, sans-serif';
            context.fillText(`1/${den}`, segX + segmentW / 2 - 20, barY + 58);
          }
        }

        // Summary cards below
        const cardY = 360;
        context.fillStyle = 'rgba(30, 41, 59, 0.7)';
        roundRect(context, barX, cardY, barW, 160, 16);
        context.fill();

        context.fillStyle = '#38bdf8';
        context.font = 'bold 24px system-ui, sans-serif';
        context.fillText(`Total Strip Length = 1 Whole Unit`, barX + 40, cardY + 45);

        context.fillStyle = '#f8fafc';
        context.font = '500 18px system-ui, sans-serif';
        context.fillText(`• ${num} blue segments filled out of ${den} total parts = ${num}/${den}`, barX + 40, cardY + 85);
        context.fillText(`• Because ${num} < ${den}, the fraction is PROPER and smaller than the full bar!`, barX + 40, cardY + 120);
      }

      // C. Step-by-Step Solver Visual
      function drawStepsVisual(context: CanvasRenderingContext2D, data: any, progress: number) {
        const steps = data.steps || [
          { stepNumber: 1, text: 'Identify the problem parameters', highlight: true },
          { stepNumber: 2, text: 'Apply the standard formula' },
          { stepNumber: 3, text: 'Calculate the final verified result' }
        ];

        const startY = 190;
        steps.forEach((st: any, idx: number) => {
          const y = startY + idx * 85;
          const isHigh = st.highlight || idx === 0;

          context.fillStyle = isHigh ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.6)';
          roundRect(context, 80, y, 1120, 68, 14);
          context.fill();
          context.strokeStyle = isHigh ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)';
          context.lineWidth = isHigh ? 2 : 1;
          context.stroke();

          // Step Circle
          context.fillStyle = isHigh ? '#3b82f6' : '#64748b';
          context.beginPath();
          context.arc(125, y + 34, 20, 0, Math.PI * 2);
          context.fill();

          context.fillStyle = '#ffffff';
          context.font = 'bold 16px system-ui, sans-serif';
          context.fillText(`S${st.stepNumber || idx + 1}`, 115, y + 40);

          // Step Text
          context.fillStyle = isHigh ? '#ffffff' : '#cbd5e1';
          context.font = isHigh ? 'bold 20px system-ui, sans-serif' : '500 18px system-ui, sans-serif';
          context.fillText(st.text, 170, y + 42);
        });
      }

      // D. Mistake Alert Visual (Side-by-side Wrong vs Right)
      function drawMistakeAlertVisual(context: CanvasRenderingContext2D, data: any, progress: number) {
        const mistake = data.commonMistake || {
          mistake: 'Assuming 4/4 is a Proper Fraction.',
          whyWrong: 'Because 4/4 = 1, numerator is not strictly less than denominator.',
          correctWay: 'Proper fractions must have Numerator strictly less than Denominator (e.g. 3/4).'
        };

        const y = 190;
        const boxW = 530;
        const boxH = 320;

        // Left Red Box (WRONG)
        context.fillStyle = 'rgba(239, 68, 68, 0.15)';
        roundRect(context, 80, y, boxW, boxH, 20);
        context.fill();
        context.strokeStyle = '#ef4444';
        context.lineWidth = 2;
        context.stroke();

        context.fillStyle = '#ef4444';
        context.font = 'bold 24px system-ui, sans-serif';
        context.fillText('❌ COMMON MISTAKE', 110, y + 45);

        context.fillStyle = '#f8fafc';
        context.font = '600 18px system-ui, sans-serif';
        context.fillText(`Trap: ${mistake.mistake}`, 110, y + 95);

        context.fillStyle = '#fca5a5';
        context.font = '500 16px system-ui, sans-serif';
        context.fillText(`Why it fails: ${mistake.whyWrong}`, 110, y + 145);

        // Right Green Box (CORRECT)
        const rightX = 670;
        context.fillStyle = 'rgba(16, 185, 129, 0.15)';
        roundRect(context, rightX, y, boxW, boxH, 20);
        context.fill();
        context.strokeStyle = '#10b981';
        context.lineWidth = 2;
        context.stroke();

        context.fillStyle = '#10b981';
        context.font = 'bold 24px system-ui, sans-serif';
        context.fillText('✓ CORRECT METHOD', rightX + 30, y + 45);

        context.fillStyle = '#f8fafc';
        context.font = '600 18px system-ui, sans-serif';
        context.fillText('Golden Rule:', rightX + 30, y + 95);

        context.fillStyle = '#6ee7b7';
        context.font = '500 16px system-ui, sans-serif';
        context.fillText(mistake.correctWay, rightX + 30, y + 140);
      }

      // E. Real-World Visual
      function drawRealWorldVisual(context: CanvasRenderingContext2D, data: any, progress: number) {
        const scenario = data.realWorldScenario || {
          title: 'Daily Life Examples of Fractions',
          story: 'Measuring time on a clock, pouring cups in cooking, or dividing fruits with classmates.',
          visualObject: '⏰ Clock (1/4 hour) & 🥛 Water Glass (3/4 full)',
          takeaway: 'Fractions are everywhere in the physical world!'
        };

        const cardX = 80;
        const cardY = 190;
        const cardW = 1120;
        const cardH = 320;

        context.fillStyle = 'rgba(30, 41, 59, 0.8)';
        roundRect(context, cardX, cardY, cardW, cardH, 20);
        context.fill();
        context.strokeStyle = '#ec4899';
        context.lineWidth = 2;
        context.stroke();

        context.fillStyle = '#f472b6';
        context.font = 'bold 26px system-ui, sans-serif';
        context.fillText(`🌍 ${scenario.title}`, cardX + 40, cardY + 55);

        context.fillStyle = '#f8fafc';
        context.font = '500 20px system-ui, sans-serif';
        context.fillText(scenario.story, cardX + 40, cardY + 110);

        context.fillStyle = '#fbbf24';
        context.font = 'bold 24px system-ui, sans-serif';
        context.fillText(scenario.visualObject, cardX + 40, cardY + 175);

        context.fillStyle = '#67e8f9';
        context.font = '600 18px system-ui, sans-serif';
        context.fillText(`Key Insight: ${scenario.takeaway}`, cardX + 40, cardY + 240);
      }

      // F. Recap Visual
      function drawRecapVisual(context: CanvasRenderingContext2D, data: any, progress: number) {
        const bullets = data.bullets || [
          'Rule 1: Numerator < Denominator',
          'Rule 2: Value is always strictly less than 1',
          'Rule 3: Represents a true part of a single whole'
        ];

        const cardX = 80;
        const cardY = 190;
        const cardW = 1120;
        const cardH = 320;

        context.fillStyle = 'rgba(30, 41, 59, 0.85)';
        roundRect(context, cardX, cardY, cardW, cardH, 20);
        context.fill();
        context.strokeStyle = '#8b5cf6';
        context.lineWidth = 2;
        context.stroke();

        context.fillStyle = '#c084fc';
        context.font = 'bold 28px system-ui, sans-serif';
        context.fillText('🏆 Core Chapter Mastery Checklist', cardX + 40, cardY + 60);

        bullets.forEach((b: string, idx: number) => {
          context.fillStyle = '#34d399';
          context.font = 'bold 22px system-ui, sans-serif';
          context.fillText('✓', cardX + 40, cardY + 120 + idx * 55);

          context.fillStyle = '#f8fafc';
          context.font = '500 20px system-ui, sans-serif';
          context.fillText(b, cardX + 75, cardY + 120 + idx * 55);
        });
      }

      // G. Formula / Standard Concept Visual
      function drawFormulaConceptVisual(context: CanvasRenderingContext2D, data: any, progress: number) {
        const cardX = 80;
        const cardY = 190;
        const cardW = 1120;
        const cardH = 320;

        context.fillStyle = 'rgba(30, 41, 59, 0.75)';
        roundRect(context, cardX, cardY, cardW, cardH, 20);
        context.fill();
        context.strokeStyle = '#3b82f6';
        context.lineWidth = 2;
        context.stroke();

        if (data.formula) {
          context.fillStyle = 'rgba(59, 130, 246, 0.2)';
          roundRect(context, cardX + 40, cardY + 40, cardW - 80, 80, 14);
          context.fill();
          context.strokeStyle = '#60a5fa';
          context.lineWidth = 1.5;
          context.stroke();

          context.fillStyle = '#ffffff';
          context.font = 'bold 26px system-ui, monospace';
          context.fillText(`Formula: ${data.formula}`, cardX + 60, cardY + 90);
        }

        const bullets = data.bullets || [
          'Understands the foundational principle',
          'Applies standard board exam formulas',
          'Mastered step-by-step verification'
        ];

        bullets.forEach((b: string, idx: number) => {
          const by = data.formula ? cardY + 160 + idx * 45 : cardY + 60 + idx * 55;
          context.fillStyle = '#38bdf8';
          context.fillText('•', cardX + 45, by);
          context.fillStyle = '#f8fafc';
          context.font = '500 19px system-ui, sans-serif';
          context.fillText(b, cardX + 75, by);
        });
      }

      // Helper for rounded rectangles
      function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }

      // Execute scene-by-scene animation loop
      let currentSceneIdx = 0;
      const totalScenes = scenes.length;

      async function processNextScene() {
        if (currentSceneIdx >= totalScenes) {
          if (onProgress) onProgress(100, 'Finalizing educational video binary...');
          setTimeout(() => {
            recorder.stop();
          }, 400);
          return;
        }

        const scene = scenes[currentSceneIdx];
        const sceneDurationSec = scene.durationSeconds || 7;
        const sceneFrames = sceneDurationSec * 30; // 30 fps
        const stageProgressBase = currentSceneIdx / totalScenes;

        if (onProgress) {
          const pct = Math.round(stageProgressBase * 100);
          onProgress(pct, `Recording Scene ${currentSceneIdx + 1}/${totalScenes}: ${scene.title}`);
        }

        playTransitionTone(audioCtx.currentTime + 0.05, 540 + currentSceneIdx * 30);

        // Start voice narration in parallel
        speakNarration(scene.narration);

        // Render animation frames for the duration of this scene
        let frameCount = 0;
        const frameIntervalMs = 1000 / 30;

        const intervalId = setInterval(() => {
          frameCount++;
          const sceneProg = frameCount / sceneFrames;
          const overallProg = stageProgressBase + (sceneProg / totalScenes);

          renderSceneFrame(scene, sceneProg, overallProg);

          if (frameCount >= sceneFrames) {
            clearInterval(intervalId);
            currentSceneIdx++;
            processNextScene();
          }
        }, frameIntervalMs);
      }

      // Kick off the recording pipeline
      processNextScene();

    } catch (err) {
      reject(err);
    }
  });
}
