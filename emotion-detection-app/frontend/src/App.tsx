import { useState, useEffect, useRef } from 'react'
import './App.css'
import { 
  History, 
  Trash2, 
  Sparkles, 
  Brain,
  Heart,
  Frown,
  Angry,
  Zap,
  Meh,
  BarChart3,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Info,
  Server,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// API Configuration
const API_BASE_URL = 'http://localhost:5000'

// Types
interface EmotionResult {
  success: boolean
  emotion: string
  confidence: number
  emoji: string
  color: string
  description: string
  intensity: string
  all_probabilities: Record<string, number>
  original_text: string
  error?: string
}

interface HistoryItem {
  id: string
  timestamp: string
  original_text: string
  emotion: string
  confidence: number
  emoji: string
}

interface ServerStatus {
  status: string
  model_loaded: boolean
  supported_emotions: string[]
}

// Emotion configuration
const EMOTION_CONFIG: Record<string, { emoji: string; color: string; label: string; icon: any }> = {
  happiness: { 
    emoji: '😊', 
    color: '#FFD700', 
    label: 'Happiness',
    icon: Heart
  },
  anger: { 
    emoji: '😠', 
    color: '#DC143C', 
    label: 'Anger',
    icon: Angry
  },
  sadness: { 
    emoji: '😢', 
    color: '#4169E1', 
    label: 'Sadness',
    icon: Frown
  },
  stress: { 
    emoji: '😰', 
    color: '#FF8C00', 
    label: 'Stress',
    icon: Zap
  },
  neutral: { 
    emoji: '😐', 
    color: '#808080', 
    label: 'Neutral',
    icon: Meh
  }
}

// Sample texts for quick testing
const SAMPLE_TEXTS = [
  "I am so happy today! Everything is going great!",
  "This makes me so angry! I can't believe this happened!",
  "I feel so sad and lonely right now...",
  "I'm so stressed about this deadline!",
  "The meeting is scheduled for tomorrow at 3 PM."
]

function App() {
  // State
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState<EmotionResult | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showProbabilities, setShowProbabilities] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  // Check server health on mount
  useEffect(() => {
    checkServerHealth()
    fetchHistory()
  }, [])

  // Scroll to result when available
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [result])

  // Check server health
  const checkServerHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      if (response.ok) {
        const data = await response.json()
        setServerStatus(data)
        setError(null)
      } else {
        setError('Server is not responding correctly')
      }
    } catch (err) {
      setError('Cannot connect to backend server. Please ensure Flask is running on port 5000.')
    }
  }

  // Fetch history
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/history?limit=20`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setHistory(data.history)
        }
      }
    } catch (err) {
      console.error('Failed to fetch history:', err)
    }
  }

  // Analyze emotion
  const analyzeEmotion = async () => {
    if (!inputText.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputText, save_history: true })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setResult(data)
          fetchHistory() // Refresh history
        } else {
          setError(data.error || 'Analysis failed')
        }
      } else {
        setError('Failed to get response from server')
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // Clear history
  const clearHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/history/clear`, {
        method: 'POST'
      })
      if (response.ok) {
        setHistory([])
      }
    } catch (err) {
      console.error('Failed to clear history:', err)
    }
  }

  // Use sample text
  const useSampleText = (text: string) => {
    setInputText(text)
    setResult(null)
  }

  // Get emotion config
  const getEmotionConfig = (emotion: string) => {
    return EMOTION_CONFIG[emotion] || { 
      emoji: '❓', 
      color: '#666', 
      label: emotion,
      icon: Meh
    }
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    Emotion Detection
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AI-Powered Text Analysis
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Server Status */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700">
                      <Server className={`w-4 h-4 ${serverStatus?.model_loaded ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={`text-xs font-medium ${serverStatus?.model_loaded ? 'text-green-600' : 'text-red-600'}`}>
                        {serverStatus?.model_loaded ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Backend Server Status</p>
                  </TooltipContent>
                </Tooltip>

                {/* History Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="gap-2"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">History</span>
                  {history.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{history.length}</Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Input */}
            <div className="lg:col-span-2 space-y-6">
              {/* Input Card */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                    Text Analysis
                  </CardTitle>
                  <CardDescription>
                    Enter text to detect emotions using our trained ML model
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Text Input */}
                  <div className="relative">
                    <Textarea
                      placeholder="Type or paste text here to analyze emotions... (e.g., 'I am so happy today!')"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[150px] resize-none text-base leading-relaxed"
                      maxLength={1000}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                      {inputText.length}/1000
                    </div>
                  </div>

                  {/* Sample Texts */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-slate-500 py-1">Try:</span>
                    {SAMPLE_TEXTS.map((text, idx) => (
                      <button
                        key={idx}
                        onClick={() => useSampleText(text)}
                        className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors truncate max-w-[150px]"
                      >
                        {text.substring(0, 30)}...
                      </button>
                    ))}
                  </div>

                  {/* Analyze Button */}
                  <Button
                    onClick={analyzeEmotion}
                    disabled={!inputText.trim() || loading}
                    className="w-full gap-2 h-12 text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Analyze Emotion
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Result Card */}
              {result && result.success && (
                <Card 
                  ref={resultRef}
                  className="shadow-lg border-0 overflow-hidden"
                  style={{ 
                    borderLeft: `4px solid ${result.color}` 
                  }}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        Analysis Result
                      </span>
                      <Badge 
                        variant="outline"
                        style={{ borderColor: result.color, color: result.color }}
                      >
                        {result.confidence}% Confidence
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Main Result */}
                    <div className="flex items-center gap-6">
                      <div 
                        className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shadow-inner"
                        style={{ backgroundColor: `${result.color}20` }}
                      >
                        {result.emoji}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold capitalize" style={{ color: result.color }}>
                          {result.emotion}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                          {result.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="capitalize">
                            {result.intensity} intensity
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Confidence Level</span>
                        <span className="font-semibold">{result.confidence}%</span>
                      </div>
                      <Progress 
                        value={result.confidence} 
                        className="h-3"
                        style={{ 
                          backgroundColor: `${result.color}30`,
                        }}
                      />
                    </div>

                    {/* All Probabilities */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <button
                        onClick={() => setShowProbabilities(!showProbabilities)}
                        className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {showProbabilities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        All Emotion Probabilities
                      </button>
                      
                      {showProbabilities && (
                        <div className="mt-4 space-y-3">
                          {Object.entries(result.all_probabilities).map(([emotion, prob]) => {
                            const config = getEmotionConfig(emotion)
                            const isSelected = emotion === result.emotion
                            return (
                              <div key={emotion} className="flex items-center gap-3">
                                <span className="text-lg">{config.emoji}</span>
                                <span className={`w-20 capitalize text-sm ${isSelected ? 'font-semibold' : ''}`}>
                                  {emotion}
                                </span>
                                <div className="flex-1">
                                  <div 
                                    className="h-2 rounded-full transition-all"
                                    style={{ 
                                      width: `${prob}%`,
                                      backgroundColor: config.color,
                                      opacity: isSelected ? 1 : 0.5
                                    }}
                                  />
                                </div>
                                <span className="w-12 text-right text-sm font-medium">
                                  {prob}%
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">How it Works</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Our model uses TF-IDF vectorization and Multinomial Naive Bayes classification 
                          trained on curated emotion datasets.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Supported Emotions</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Happiness, Anger, Sadness, Stress, and Neutral emotions are detected 
                          with confidence scores.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - History */}
            <div className={`lg:col-span-1 ${showHistory ? 'block' : 'hidden lg:block'}`}>
              <Card className="shadow-lg border-0 h-full max-h-[calc(100vh-140px)]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <History className="w-5 h-5 text-indigo-500" />
                      Recent Analysis
                    </CardTitle>
                    {history.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearHistory}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    {history.length} {history.length === 1 ? 'analysis' : 'analyses'} in history
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    {history.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <History className="w-12 h-12 text-slate-300 mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                          No analysis history yet.
                        </p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                          Start analyzing text to see history here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 px-4 pb-4">
                        {history.map((item) => {
                          const config = getEmotionConfig(item.emotion)
                          return (
                            <div
                              key={item.id}
                              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group"
                              onClick={() => useSampleText(item.original_text)}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">{config.emoji}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-900 dark:text-white truncate">
                                    {item.original_text}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs capitalize"
                                      style={{ borderColor: config.color, color: config.color }}
                                    >
                                      {item.emotion}
                                    </Badge>
                                    <span className="text-xs text-slate-400">
                                      {item.confidence}%
                                    </span>
                                    <span className="text-xs text-slate-400 ml-auto">
                                      {formatTime(item.timestamp)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span>Emotion Detection API v1.0</span>
                <span>•</span>
                <span>Flask + React + scikit-learn</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Model: Multinomial Naive Bayes</span>
                <span>•</span>
                <span>Features: TF-IDF</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  )
}

export default App
