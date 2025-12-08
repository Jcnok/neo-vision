/**
 * Engine de Renderização Client-Side para NoelVision (Otimizada - Apenas Voz)
 * 
 * MELHORIAS DE PERFORMANCE:
 * 1. FPS reduzido para 24 (Cinematic).
 * 2. Sem processamento de música de fundo (apenas voz original).
 * 3. Limpeza de recursos agressiva.
 */

export const renderFinalVideo = async (
    videoUrls: string[], 
    onProgress: (msg: string) => void
  ): Promise<Blob> => {
    
    if (videoUrls.length === 0) throw new Error("Nenhum vídeo para renderizar");
  
    // 1. Configuração do Canvas (Estúdio Virtual)
    const canvas = document.createElement('canvas');
    canvas.width = 1280; 
    canvas.height = 720;
    const ctx = canvas.getContext('2d', { 
      alpha: false, 
      desynchronized: true 
    });
    if (!ctx) throw new Error("Canvas context falhou");
  
    // 2. Configuração de Áudio (Apenas Mixer de Voz)
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dest = audioCtx.createMediaStreamDestination();
    
    // 3. Preparar Gravador
    const FPS = 24; 
    const canvasStream = canvas.captureStream(FPS);
    
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks() // Captura apenas o áudio direcionado ao 'dest' (voz do vídeo)
    ]);
  
    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 2500000 
    });
  
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
  
    // 4. Lógica de Renderização
    return new Promise(async (resolve, reject) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        // Limpeza de memória
        audioCtx.close();
        canvasStream.getTracks().forEach(t => t.stop());
        resolve(blob);
      };
  
      recorder.start(); 
      
      try {
        for (let i = 0; i < videoUrls.length; i++) {
          onProgress(`Processando cena ${i + 1}/${videoUrls.length}...`);
          // Passamos o audioCtx e dest para mixar o áudio do vídeo original
          await playVideoOnCanvas(videoUrls[i], ctx, canvas, audioCtx, dest);
        }
        
        onProgress("Finalizando arquivo...");
        setTimeout(() => {
          if (recorder.state === 'recording') recorder.stop();
        }, 500);
  
      } catch (e) {
        if (recorder.state === 'recording') recorder.stop();
        reject(e);
      }
    });
  };
  
  function playVideoOnCanvas(
    url: string, 
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement,
    audioCtx: AudioContext,
    dest: MediaStreamAudioDestinationNode
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const vid = document.createElement('video');
      vid.src = url;
      vid.crossOrigin = "anonymous";
      vid.muted = false; // Importante para capturar o áudio
      vid.preload = "auto";
  
      vid.onplay = () => {
          try {
            // Conecta o áudio do vídeo (Voz do Papai Noel) ao destino de gravação
            const vidSource = audioCtx.createMediaElementSource(vid);
            vidSource.connect(dest);
          } catch(e) {
             // Ignorar erros se o elemento já estiver conectado
          }
      };
  
      vid.onended = () => resolve();
      vid.onerror = (e) => reject(e);
  
      const draw = () => {
        if (vid.paused || vid.ended) return;
        ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(draw);
      };
  
      vid.play().then(draw).catch(reject);
    });
  }