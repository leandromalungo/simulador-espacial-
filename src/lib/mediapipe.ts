import { GAME_CONFIG } from './game-config';
import { HandPosition } from '../types/game';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandResults {
  multiHandLandmarks?: HandLandmark[][];
  multiHandedness?: Array<{ label: string; score: number }>;
}

export class MediaPipeHandTracker {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private hands: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private camera: any = null;
  private videoElement: HTMLVideoElement | null = null;
  private onHandUpdateCallback: ((pos: HandPosition) => void) | null = null;
  private onResultsCallback: ((results: HandResults) => void) | null = null;
  private isRunning: boolean = false;
  private isInitialized: boolean = false;

  // Smoothing state
  private smoothX: number = 0;
  private smoothY: number = 0;
  private fistFrameCount: number = 0;
  private openFrameCount: number = 0;
  private currentClosedState: boolean = false;

  public async initialize(
    videoElement: HTMLVideoElement,
    onHandUpdate: (pos: HandPosition) => void,
    onRawResults?: (results: HandResults) => void
  ): Promise<boolean> {
    if (this.isInitialized && this.hands) {
      return true;
    }

    this.videoElement = videoElement;
    this.onHandUpdateCallback = onHandUpdate;
    this.onResultsCallback = onRawResults || null;

    try {
      // Dynamic import to avoid SSR issues
      const handsPkg = await import('@mediapipe/hands');
      const cameraPkg = await import('@mediapipe/camera_utils');

      const HandsConstructor = handsPkg.Hands || (handsPkg as unknown as { default: { Hands: typeof handsPkg.Hands } }).default?.Hands;
      const CameraConstructor = cameraPkg.Camera || (cameraPkg as unknown as { default: { Camera: typeof cameraPkg.Camera } }).default?.Camera;

      if (!HandsConstructor) {
        throw new Error('Could not find MediaPipe Hands constructor');
      }

      this.hands = new HandsConstructor({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      this.hands.onResults((results: HandResults) => {
        this.processResults(results);
      });

      if (CameraConstructor && this.videoElement) {
        this.camera = new CameraConstructor(this.videoElement, {
          onFrame: async () => {
            if (this.isRunning && this.hands && this.videoElement) {
              await this.hands.send({ image: this.videoElement });
            }
          },
          width: 640,
          height: 480,
        });
      }

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('Failed to initialize MediaPipe Hands:', err);
      return false;
    }
  }

  public async start(): Promise<void> {
    if (!this.isInitialized || !this.camera) return;
    try {
      this.isRunning = true;
      await this.camera.start();
    } catch (err) {
      this.isRunning = false;
      throw err;
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.camera) {
      try {
        this.camera.stop();
      } catch (e) {
        console.warn('Error stopping camera:', e);
      }
    }
    // Release video tracks explicitly
    if (this.videoElement && this.videoElement.srcObject) {
      const stream = this.videoElement.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      this.videoElement.srcObject = null;
    }
  }

  public destroy(): void {
    this.stop();
    if (this.hands) {
      try {
        this.hands.close();
      } catch {}
      this.hands = null;
    }
    this.camera = null;
    this.videoElement = null;
    this.isInitialized = false;
  }

  private processResults(results: HandResults): void {
    if (this.onResultsCallback) {
      this.onResultsCallback(results);
    }

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      if (this.onHandUpdateCallback) {
        this.onHandUpdateCallback({
          x: this.smoothX,
          y: this.smoothY,
          isClosed: false,
          detected: false,
        });
      }
      return;
    }

    const landmarks = results.multiHandLandmarks[0];

    // Landmark 0 is wrist
    // Landmark 9 is middle finger MCP (base)
    // Using mirrored coordinate formula: x = 1 - wrist.x, y = wrist.y
    const wrist = landmarks[0];
    const rawX = 1 - wrist.x;
    const rawY = wrist.y;

    // Map to normalized range: -1 to 1 (center is 0)
    // Apply center remapping with slight margin (0.2 to 0.8 -> -1 to 1)
    const targetX = Math.max(-1, Math.min(1, (rawX - 0.5) * 2.5));
    const targetY = Math.max(-1, Math.min(1, (0.5 - rawY) * 2.5)); // Invert Y so up is positive

    // Apply deadzone
    const deadzone = GAME_CONFIG.handTracking.deadzone;
    const filteredTargetX = Math.abs(targetX) < deadzone ? 0 : targetX;
    const filteredTargetY = Math.abs(targetY) < deadzone ? 0 : targetY;

    // Low-pass exponential smoothing
    const alpha = GAME_CONFIG.handTracking.smoothing;
    this.smoothX = this.smoothX * (1 - alpha) + filteredTargetX * alpha;
    this.smoothY = this.smoothY * (1 - alpha) + filteredTargetY * alpha;

    // Detect closed fist:
    // Landmark 0: wrist, 9: middle finger MCP
    // 8: index tip, 12: middle tip, 16: ring tip, 20: pinky tip
    // Distance between fingertip and palm base/MCP
    const palmBase = landmarks[0];
    const tips = [8, 12, 16, 20];
    const mcpJoints = [5, 9, 13, 17];

    let closedFingers = 0;
    for (let i = 0; i < tips.length; i++) {
      const tip = landmarks[tips[i]];
      const mcp = landmarks[mcpJoints[i]];

      // Distance from tip to wrist vs MCP to wrist
      const distTipToPalm = Math.hypot(tip.x - palmBase.x, tip.y - palmBase.y);
      const distMcpToPalm = Math.hypot(mcp.x - palmBase.x, mcp.y - palmBase.y);

      // If tip is closer to palm than or near MCP, finger is curled
      if (distTipToPalm < distMcpToPalm * 1.1) {
        closedFingers++;
      }
    }

    const isFistCandidate = closedFingers >= 3;

    // Temporal hysteresis for state stability
    if (isFistCandidate) {
      this.fistFrameCount++;
      this.openFrameCount = 0;
      if (this.fistFrameCount >= 2) {
        this.currentClosedState = true;
      }
    } else {
      this.openFrameCount++;
      this.fistFrameCount = 0;
      if (this.openFrameCount >= 2) {
        this.currentClosedState = false;
      }
    }

    if (this.onHandUpdateCallback) {
      this.onHandUpdateCallback({
        x: this.smoothX,
        y: this.smoothY,
        isClosed: this.currentClosedState,
        detected: true,
        rawX,
        rawY,
      });
    }
  }
}

export const handTracker = new MediaPipeHandTracker();
