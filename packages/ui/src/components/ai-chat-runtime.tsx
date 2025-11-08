"use client"

import React, { useMemo } from "react"
import { AssistantRuntimeProvider, createRuntime } from "@assistant-ui/react"

interface AIChatRuntimeProviderProps {
  children: React.ReactNode
}

export function AIChatRuntimeProvider({ children }: AIChatRuntimeProviderProps) {
  const runtime = useMemo(() => {
    return createRuntime({
      adapter: {
        async subscribe(onUpdate) {
          // Initialize with empty state
          onUpdate({
            status: 'idle',
            messages: [],
          })

          // Return cleanup function
          return () => {
            // Cleanup subscription
          }
        },
        async append({ context, parts }) {
          // Find text content from parts
          const textPart = parts.find((part): part is { type: 'text'; text: string } => 
            part.type === 'text'
          )
          
          const userContent = textPart?.text || ''
          
          // Add user message immediately
          const userMessageId = `user-${Date.now()}`
          context.addMessages([
            {
              id: userMessageId,
              role: 'user',
              content: [{ type: 'text', text: userContent }],
            },
          ])
          
          // Simulate AI thinking delay
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Generate AI response
          const aiResponse = generateAIResponse(userContent)
          
          // Add AI response
          const assistantMessageId = `assistant-${Date.now()}`
          context.addMessages([
            {
              id: assistantMessageId,
              role: 'assistant',
              content: [{ type: 'text', text: aiResponse }],
            },
          ])
        },
      },
    })
  }, [])

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}

/**
 * Generate AI response based on user input
 * In production, this would call an AI provider like OpenAI or Anthropic
 */
function generateAIResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()
  
  if (message.includes('service') || message.includes('offer')) {
    return `We offer comprehensive cancer support services including:\n\n- **Counseling**: One-on-one sessions with licensed mental health professionals\n- **Support Groups**: Peer support for patients and families\n- **Educational Resources**: Articles, guides, and information about cancer\n- **Financial Assistance**: Help with treatment costs and living expenses\n- **Transportation**: Rides to medical appointments\n\nWould you like to learn more about any of these services?`
  }
  
  if (message.includes('counselor') || message.includes('find') || message.includes('help')) {
    return `Finding the right counselor is important. Here's how we can help:\n\n1. **Browse Counselors**: View profiles of licensed mental health professionals\n2. **Filter by Specialty**: Find counselors who specialize in cancer support\n3. **Check Availability**: See when counselors have open appointment slots\n4. **Schedule Sessions**: Book appointments directly through our platform\n\nWould you like to browse our available counselors now?`
  }
  
  if (message.includes('resource') || message.includes('educat') || message.includes('learn')) {
    return `We have a comprehensive library of resources:\n\n- **Articles**: Evidence-based information about cancer types, treatments, and coping strategies\n- **Guides**: Step-by-step guides for navigating diagnosis, treatment, and recovery\n- **Videos**: Educational and inspirational content from medical professionals\n- **Tools**: Checklists, templates, and worksheets to help you stay organized\n\nWhat would you like to learn about?`
  }
  
  if (message.includes('support') || message.includes('group')) {
    return `Support groups can be incredibly helpful. We offer:\n\n- **Patient Support Groups**: Connect with others going through similar experiences\n- **Family Support Groups**: For family members and caregivers\n- **Specialty Groups**: For specific cancer types or situations\n- **Online Options**: Virtual groups for those who can't attend in person\n\nWould you like to find a support group that's right for you?`
  }
  
  if (message.includes('appointment') || message.includes('session') || message.includes('book')) {
    return `Scheduling a session is easy:\n\n1. Go to the "Find Counselors" section\n2. Browse available professionals\n3. Select a counselor and choose a time slot\n4. Confirm your appointment\n\nAppointments can be in-person or virtual, whichever is more convenient for you. Would you like help finding an available counselor?`
  }
  
  // Default helpful response
  return `I'm here to help you with:\n\n- Finding counselors and mental health support\n- Learning about cancer resources and information\n- Understanding our services and programs\n- Navigating appointments and scheduling\n- Accessing educational materials\n\nWhat would you like to know more about?`
}
