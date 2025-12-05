'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw, AlertCircle } from 'lucide-react'

interface CaptchaProps {
  onVerify: (isValid: boolean) => void
  onCaptchaChange?: (value: string) => void
  disabled?: boolean
  error?: string
}

export function Captcha({ onVerify, onCaptchaChange, disabled = false, error }: CaptchaProps) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [isVerified, setIsVerified] = useState(false)

  // Generate random math question
  const generateQuestion = () => {
    let num1 = Math.floor(Math.random() * 10) + 1
    let num2 = Math.floor(Math.random() * 10) + 1
    const operations = ['+', '-', '*']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    let correctAnswer = 0
    let questionText = ''
    
    switch (operation) {
      case '+':
        correctAnswer = num1 + num2
        questionText = `${num1} + ${num2} = ?`
        break
      case '-':
        // Ensure positive result
        if (num1 < num2) {
          [num1, num2] = [num2, num1]
        }
        correctAnswer = num1 - num2
        questionText = `${num1} - ${num2} = ?`
        break
      case '*':
        // Keep multiplication simple
        const smallNum1 = Math.floor(Math.random() * 5) + 1
        const smallNum2 = Math.floor(Math.random() * 5) + 1
        correctAnswer = smallNum1 * smallNum2
        questionText = `${smallNum1} × ${smallNum2} = ?`
        break
    }
    
    setQuestion(questionText)
    setAnswer(correctAnswer.toString())
    setUserAnswer('')
    setIsVerified(false)
    onVerify(false)
    if (onCaptchaChange) {
      onCaptchaChange('')
    }
  }

  // Generate question on mount
  useEffect(() => {
    generateQuestion()
  }, [])

  // Verify answer when user input changes
  useEffect(() => {
    if (userAnswer.trim() === '') {
      setIsVerified(false)
      onVerify(false)
      if (onCaptchaChange) {
        onCaptchaChange('')
      }
      return
    }

    const isValid = userAnswer.trim() === answer
    setIsVerified(isValid)
    onVerify(isValid)
    if (onCaptchaChange) {
      onCaptchaChange(userAnswer.trim())
    }
  }, [userAnswer, answer, onVerify, onCaptchaChange])

  const handleRefresh = () => {
    generateQuestion()
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="captcha" className="text-sm font-medium">
        İnsan Doğrulaması
      </Label>
      
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-mono font-medium text-gray-900 dark:text-gray-100">
                {question}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={disabled}
                className="h-8 w-8 p-0"
                title="Yenile"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <Input
            id="captcha"
            type="text"
            placeholder="Cevap"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={disabled}
            className={isVerified ? 'border-green-500 focus:border-green-500' : error ? 'border-red-500 focus:border-red-500' : ''}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {isVerified && (
        <div className="text-sm text-green-600 dark:text-green-400">
          ✓ Doğrulama başarılı
        </div>
      )}
    </div>
  )
}