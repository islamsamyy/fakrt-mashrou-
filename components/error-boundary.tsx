'use client'

import React, { ReactNode, useState } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * BUG #12 FIX: Global error boundary with retry button
 * Catches errors and displays localized Arabic error messages
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error, this.retry) || (
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                <div className="mb-4">
                  <span className="material-symbols-outlined text-6xl text-red-500">error</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">حدث خطأ</h2>
                <p className="text-slate-400 mb-6">
                  عذراً، حدث خطأ غير متوقع. يرجى المحاولة مجدداً.
                </p>
                <button
                  onClick={this.retry}
                  className="w-full bg-primary-container text-background font-bold py-3 rounded-lg hover:opacity-90 transition"
                >
                  حاول مرة أخرى
                </button>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

/**
 * API Error Toast Hook
 * Shows errors with retry button for failed API requests
 */
interface ApiError {
  message: string
  statusCode?: number
  retry?: () => Promise<void>
}

export function useApiErrorHandler() {
  const [error, setError] = useState<ApiError | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleError = (err: unknown, retryFn?: () => Promise<void>) => {
    let message = 'حدث خطأ. يرجى المحاولة مرة أخرى'
    let statusCode = 500

    if (err instanceof Error) {
      if (err.message.includes('Failed to fetch')) {
        message = 'فقد الاتصال بالإنترنت. يرجى التحقق من الاتصال.'
        statusCode = 0
      } else if (err.message.includes('401')) {
        message = 'جلستك انتهت. يرجى تسجيل الدخول مرة أخرى'
        statusCode = 401
      } else if (err.message.includes('404')) {
        message = 'البيانات المطلوبة غير موجودة'
        statusCode = 404
      } else if (err.message.includes('500')) {
        message = 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً'
        statusCode = 500
      } else {
        message = err.message
      }
    }

    setError({ message, statusCode, retry: retryFn })
  }

  const retry = async () => {
    if (!error?.retry) return

    setIsRetrying(true)
    try {
      await error.retry()
      setError(null)
    } catch (err) {
      handleError(err)
    } finally {
      setIsRetrying(false)
    }
  }

  const clearError = () => setError(null)

  return { error, isRetrying, handleError, retry, clearError }
}

/**
 * API Error Toast Component
 * Displays error messages with retry button
 */
interface ApiErrorToastProps {
  error: ApiError | null
  onRetry: () => void
  onClose: () => void
  isRetrying?: boolean
}

export function ApiErrorToast({ error, onRetry, onClose, isRetrying }: ApiErrorToastProps) {
  if (!error) return null

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto max-w-md z-50">
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5">error</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium">{error.message}</p>
            {error.statusCode === 0 && (
              <p className="text-xs text-slate-400 mt-1">تحقق من الاتصال بالإنترنت وحاول مجدداً</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-slate-500 hover:text-white transition"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {error.retry && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="flex-1 bg-primary-container/20 hover:bg-primary-container/30 text-primary-container font-medium text-sm py-2 rounded transition disabled:opacity-50"
            >
              {isRetrying ? 'جاري الإعادة...' : 'حاول مرة أخرى'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
