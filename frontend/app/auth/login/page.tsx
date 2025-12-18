"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Mail, Lock, Camera } from "lucide-react"
import * as faceapi from 'face-api.js'

export default function LoginPage() {
  const { login, faceLogin, isLoading: authLoading, user } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const snapshotRef = useRef<HTMLCanvasElement>(null)
  const autoLoginTriggeredRef = useRef(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push("/")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ])
        setModelLoaded(true)
      } catch (err) {
        console.error('Error loading models:', err)
        setError('Failed to load AI models for facial recognition')
      }
    }
    loadModels()
  }, [])

  const startCamera = async () => {
    if (!modelLoaded) {
      setError('AI models not loaded yet')
      return
    }
    setCameraActive(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        try {
          await videoRef.current.play()
        } catch (playErr) {
          
          console.warn('Video play() promise rejected:', playErr)
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Camera access denied or unavailable')
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    setCameraActive(false)
    setFaceDetected(false)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const handleVideoPlaying = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current

    const interval = setInterval(async () => {
      if (!cameraActive) {
        clearInterval(interval)
        return
      }

      // Use rendered dimensions for drawing
      const displaySize = { width: video.clientWidth, height: video.clientHeight }
      // Keep canvas element pixel size in sync with displayed video size
      if (displaySize.width > 0 && displaySize.height > 0) {
        canvas.width = displaySize.width
        canvas.height = displaySize.height
      }
      if (displaySize.width <= 0 || displaySize.height <= 0) {
        console.warn('Invalid video dimensions, skipping frame:', displaySize)
        return // Skip until dimensions are valid
      }

      faceapi.matchDimensions(canvas, displaySize)

      try {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          faceapi.draw.drawDetections(canvas, resizedDetections)
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        }
        setFaceDetected(detections.length > 0)
      } catch (err) {
        console.error('Detection error:', err)
      }
    }, 200)

    return () => clearInterval(interval)
  }

  const handleFaceLogin = async () => {
    if (!faceDetected || !videoRef.current || !snapshotRef.current) {
      setError('No face detected. Position your face in the camera.')
      return
    }
    const video = videoRef.current
    const intrinsicSize = { width: video.videoWidth, height: video.videoHeight }
    if (intrinsicSize.width <= 0 || intrinsicSize.height <= 0) {
      setError('Invalid video dimensions. Please try restarting the camera.')
      return
    }
    setIsSubmitting(true)
    setError('')


    const canvas = snapshotRef.current
    canvas.width = intrinsicSize.width
    canvas.height = intrinsicSize.height
    const context = canvas.getContext('2d')
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
    }
    const detection = await faceapi.detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor()
    stopCamera()

    if (!detection) {
      setError('Failed to detect face for recognition')
      setIsSubmitting(false)
      return
    }

    const faceDescriptor = detection.descriptor 

    try {
      const result = await faceLogin()
      if (!result.success) {
        setError('Face recognition failed. Try again or use password.')
        setIsSubmitting(false)
        return
      }
    } catch (err) {
      setError('Face login error: ' + (err as Error).message)
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (faceDetected && cameraActive && !isSubmitting && !autoLoginTriggeredRef.current) {
      autoLoginTriggeredRef.current = true
      handleFaceLogin().catch(err => console.error('Auto face login error:', err))
    }
  }, [faceDetected, cameraActive, isSubmitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (!email || !password) {
      setError("Please fill in all fields")
      setIsSubmitting(false)
      return
    }

    const result = await login(email, password)
    if (!result.success) {
      setError(result.message || "Login failed")
      setIsSubmitting(false)
    } else {
      router.push("/")
    }
  }

  if (authLoading && !isSubmitting) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Sign in to your FraudShield AI account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* AI Facial Recognition Section */}
        <div className="mt-6 space-y-4">
          <div className="text-center text-sm text-muted-foreground">Or use AI Facial Recognition</div>
          {!cameraActive ? (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={startCamera} 
              disabled={!modelLoaded || isSubmitting}
            >
              <Camera className="mr-2 h-4 w-4" />
              {modelLoaded ? 'Start Face Login' : 'Loading AI...'}
            </Button>
          ) : (
            <div className="relative video-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                onPlaying={handleVideoPlaying}
                className="rounded-md"
                style={{ pointerEvents: 'none' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
              />
              <div className="mt-2 flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={stopCamera}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleFaceLogin} 
                  disabled={!faceDetected || isSubmitting} 
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recognizing...
                    </>
                  ) : (
                    'Login with Face'
                  )}
                </Button>
              </div>
            </div>
          )}
          {/* Hidden snapshot canvas for descriptor computation */}
          <canvas ref={snapshotRef} style={{ display: 'none' }} />
        </div>
      </CardContent>
      <CardFooter className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}