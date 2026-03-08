// /**
//  * DEDA AI Chat Service
//  * Powered by Claude API
//  *
//  * DEDA is the AI assistant for MyBizTools, helping African entrepreneurs
//  * with business advice, strategy, and general business queries.
//  */

// import prisma from '../lib/prisma.js';

// // Claude API Configuration
// const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
// const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
// const MODEL = 'claude-sonnet-4-20250514'; // Using Claude Sonnet for cost efficiency

// // Usage limits by plan
// const USAGE_LIMITS = {
//   free: { messagesPerDay: 10, tokensPerMessage: 1000 },
//   pro: { messagesPerDay: 100, tokensPerMessage: 4000 },
//   enterprise: { messagesPerDay: 1000, tokensPerMessage: 8000 },
// };

// // System prompt for DEDA
// const SYSTEM_PROMPT = `You are DEDA, an AI business assistant for MyBizTools, a platform designed for African entrepreneurs.

// Your role is to:
// 1. Provide practical business advice tailored to the African market
// 2. Help with business planning, strategy, and growth
// 3. Assist with financial calculations and analysis
// 4. Offer guidance on marketing, sales, and customer relationships
// 5. Help with Nigerian tax regulations and compliance
// 6. Provide templates and frameworks for common business tasks

// Important guidelines:
// - Be concise and practical in your responses
// - Consider the local Nigerian/African business context
// - Use Naira (₦) for currency examples
// - Be encouraging and supportive
// - If asked about specific legal or financial advice, recommend consulting professionals
// - Keep responses focused and actionable

// Remember: You're helping small and medium business owners succeed.`;

// export interface ChatInput {
//   userId: string;
//   conversationId?: string;
//   message: string;
//   context?: string;
// }

// export interface ChatResponse {
//   success: boolean;
//   message: string;
//   data?: {
//     response: string;
//     conversationId: string;
//     tokensUsed: number;
//   };
//   error?: string;
// }

// export class DedaService {
//   /**
//    * Send a message to DEDA
//    */
//   static async chat(input: ChatInput): Promise<ChatResponse> {
//     try {
//       const { userId, conversationId, message, context } = input;

//       // Check if Claude API is configured
//       if (!ANTHROPIC_API_KEY) {
//         return {
//           success: false,
//           message: 'AI service is not configured. Please add ANTHROPIC_API_KEY to environment variables.',
//           error: 'API_NOT_CONFIGURED',
//         };
//       }

//       // Get user's plan for usage limits
//       const user = await prisma.user.findUnique({
//         where: { id: userId },
//         select: { current_plan: true },
//       });

//       const plan = (user?.current_plan || 'free') as keyof typeof USAGE_LIMITS;
//       const limits = USAGE_LIMITS[plan] || USAGE_LIMITS.free;

//       // Check daily usage
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       const todayMessages = await prisma.chatMessage.count({
//         where: {
//           conversation: { user_id: userId },
//           role: 'user',
//           created_at: { gte: today },
//         },
//       });

//       if (todayMessages >= limits.messagesPerDay) {
//         return {
//           success: false,
//           message: `You've reached your daily limit of ${limits.messagesPerDay} messages. Upgrade your plan for more.`,
//           error: 'DAILY_LIMIT_REACHED',
//         };
//       }

//       // Get or create conversation
//       let conversation;
//       if (conversationId) {
//         conversation = await prisma.chatConversation.findFirst({
//           where: { id: conversationId, user_id: userId },
//           include: {
//             messages: {
//               orderBy: { created_at: 'desc' },
//               take: 10,
//             },
//           },
//         });
//       }

//       if (!conversation) {
//         conversation = await prisma.chatConversation.create({
//           data: {
//             user_id: userId,
//             title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
//             context,
//           },
//           include: { messages: true },
//         });
//       }

//       // Build messages for Claude API
//       const messages = [];

//       // Add conversation history (reversed to chronological order)
//       if (conversation.messages && conversation.messages.length > 0) {
//         const history = [...conversation.messages].reverse();
//         for (const msg of history) {
//           messages.push({
//             role: msg.role === 'assistant' ? 'assistant' : 'user',
//             content: msg.content,
//           });
//         }
//       }

//       // Add current message
//       messages.push({
//         role: 'user',
//         content: message,
//       });

//       // Call Claude API
//       const response = await fetch(ANTHROPIC_API_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-api-key': ANTHROPIC_API_KEY,
//           'anthropic-version': '2023-06-01',
//         },
//         body: JSON.stringify({
//           model: MODEL,
//           max_tokens: limits.tokensPerMessage,
//           system: context
//             ? `${SYSTEM_PROMPT}\n\nAdditional context about the user's business:\n${context}`
//             : SYSTEM_PROMPT,
//           messages,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Claude API error:', response.status, errorData);
//         return {
//           success: false,
//           message: 'Failed to get response from AI',
//           error: 'API_ERROR',
//         };
//       }

//       const data = await response.json() as { content?: { text?: string }[]; usage?: { output_tokens?: number } };
//       const assistantResponse = data.content?.[0]?.text || 'I apologize, but I could not generate a response.';
//       const tokensUsed = data.usage?.output_tokens || 0;

//       // Save messages to database
//       await prisma.$transaction([
//         // Save user message
//         prisma.chatMessage.create({
//           data: {
//             conversation_id: conversation.id,
//             role: 'user',
//             content: message,
//           },
//         }),
//         // Save assistant response
//         prisma.chatMessage.create({
//           data: {
//             conversation_id: conversation.id,
//             role: 'assistant',
//             content: assistantResponse,
//             tokens_used: tokensUsed,
//           },
//         }),
//         // Update conversation stats
//         prisma.chatConversation.update({
//           where: { id: conversation.id },
//           data: {
//             message_count: { increment: 2 },
//             token_usage: { increment: tokensUsed },
//           },
//         }),
//       ]);

//       return {
//         success: true,
//         message: 'Response generated successfully',
//         data: {
//           response: assistantResponse,
//           conversationId: conversation.id,
//           tokensUsed,
//         },
//       };
//     } catch (error) {
//       console.error('DEDA chat error:', error);
//       return {
//         success: false,
//         message: 'Failed to process chat message',
//         error: 'CHAT_FAILED',
//       };
//     }
//   }

//   /**
//    * Get user's conversations
//    */
//   static async getConversations(userId: string, page: number = 1, limit: number = 20) {
//     try {
//       const skip = (page - 1) * limit;

//       const [conversations, total] = await Promise.all([
//         prisma.chatConversation.findMany({
//           where: { user_id: userId, is_archived: false },
//           orderBy: { updated_at: 'desc' },
//           skip,
//           take: limit,
//           select: {
//             id: true,
//             title: true,
//             message_count: true,
//             created_at: true,
//             updated_at: true,
//           },
//         }),
//         prisma.chatConversation.count({
//           where: { user_id: userId, is_archived: false },
//         }),
//       ]);

//       return {
//         success: true,
//         data: {
//           conversations,
//           pagination: {
//             current: page,
//             limit,
//             total,
//             pages: Math.ceil(total / limit),
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Get conversations error:', error);
//       return {
//         success: false,
//         message: 'Failed to retrieve conversations',
//         error: 'GET_CONVERSATIONS_FAILED',
//       };
//     }
//   }

//   /**
//    * Get conversation messages
//    */
//   static async getConversationMessages(
//     userId: string,
//     conversationId: string,
//     page: number = 1,
//     limit: number = 50
//   ) {
//     try {
//       const conversation = await prisma.chatConversation.findFirst({
//         where: { id: conversationId, user_id: userId },
//       });

//       if (!conversation) {
//         return {
//           success: false,
//           message: 'Conversation not found',
//           error: 'CONVERSATION_NOT_FOUND',
//         };
//       }

//       const skip = (page - 1) * limit;

//       const [messages, total] = await Promise.all([
//         prisma.chatMessage.findMany({
//           where: { conversation_id: conversationId },
//           orderBy: { created_at: 'asc' },
//           skip,
//           take: limit,
//           select: {
//             id: true,
//             role: true,
//             content: true,
//             feedback: true,
//             created_at: true,
//           },
//         }),
//         prisma.chatMessage.count({
//           where: { conversation_id: conversationId },
//         }),
//       ]);

//       return {
//         success: true,
//         data: {
//           conversation: {
//             id: conversation.id,
//             title: conversation.title,
//             context: conversation.context,
//           },
//           messages,
//           pagination: {
//             current: page,
//             limit,
//             total,
//             pages: Math.ceil(total / limit),
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Get messages error:', error);
//       return {
//         success: false,
//         message: 'Failed to retrieve messages',
//         error: 'GET_MESSAGES_FAILED',
//       };
//     }
//   }

//   /**
//    * Archive a conversation
//    */
//   static async archiveConversation(userId: string, conversationId: string) {
//     try {
//       const conversation = await prisma.chatConversation.findFirst({
//         where: { id: conversationId, user_id: userId },
//       });

//       if (!conversation) {
//         return {
//           success: false,
//           message: 'Conversation not found',
//           error: 'CONVERSATION_NOT_FOUND',
//         };
//       }

//       await prisma.chatConversation.update({
//         where: { id: conversationId },
//         data: { is_archived: true },
//       });

//       return {
//         success: true,
//         message: 'Conversation archived successfully',
//       };
//     } catch (error) {
//       console.error('Archive conversation error:', error);
//       return {
//         success: false,
//         message: 'Failed to archive conversation',
//         error: 'ARCHIVE_FAILED',
//       };
//     }
//   }

//   /**
//    * Delete a conversation
//    */
//   static async deleteConversation(userId: string, conversationId: string) {
//     try {
//       const conversation = await prisma.chatConversation.findFirst({
//         where: { id: conversationId, user_id: userId },
//       });

//       if (!conversation) {
//         return {
//           success: false,
//           message: 'Conversation not found',
//           error: 'CONVERSATION_NOT_FOUND',
//         };
//       }

//       await prisma.chatConversation.delete({
//         where: { id: conversationId },
//       });

//       return {
//         success: true,
//         message: 'Conversation deleted successfully',
//       };
//     } catch (error) {
//       console.error('Delete conversation error:', error);
//       return {
//         success: false,
//         message: 'Failed to delete conversation',
//         error: 'DELETE_FAILED',
//       };
//     }
//   }

//   /**
//    * Provide feedback on a message
//    */
//   static async provideFeedback(
//     userId: string,
//     messageId: string,
//     feedback: 'helpful' | 'not_helpful'
//   ) {
//     try {
//       const message = await prisma.chatMessage.findFirst({
//         where: {
//           id: messageId,
//           conversation: { user_id: userId },
//         },
//       });

//       if (!message) {
//         return {
//           success: false,
//           message: 'Message not found',
//           error: 'MESSAGE_NOT_FOUND',
//         };
//       }

//       await prisma.chatMessage.update({
//         where: { id: messageId },
//         data: { feedback },
//       });

//       return {
//         success: true,
//         message: 'Feedback recorded successfully',
//       };
//     } catch (error) {
//       console.error('Provide feedback error:', error);
//       return {
//         success: false,
//         message: 'Failed to record feedback',
//         error: 'FEEDBACK_FAILED',
//       };
//     }
//   }

//   /**
//    * Get usage stats for user
//    */
//   static async getUsageStats(userId: string) {
//     try {
//       const user = await prisma.user.findUnique({
//         where: { id: userId },
//         select: { current_plan: true },
//       });

//       const plan = (user?.current_plan || 'free') as keyof typeof USAGE_LIMITS;
//       const limits = USAGE_LIMITS[plan] || USAGE_LIMITS.free;

//       // Get today's usage
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       const todayMessages = await prisma.chatMessage.count({
//         where: {
//           conversation: { user_id: userId },
//           role: 'user',
//           created_at: { gte: today },
//         },
//       });

//       // Get total usage
//       const totalStats = await prisma.chatConversation.aggregate({
//         where: { user_id: userId },
//         _sum: { message_count: true, token_usage: true },
//         _count: true,
//       });

//       return {
//         success: true,
//         data: {
//           plan,
//           limits,
//           usage: {
//             messagesUsedToday: todayMessages,
//             messagesRemainingToday: Math.max(0, limits.messagesPerDay - todayMessages),
//             totalConversations: totalStats._count,
//             totalMessages: totalStats._sum.message_count || 0,
//             totalTokens: totalStats._sum.token_usage || 0,
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Get usage stats error:', error);
//       return {
//         success: false,
//         message: 'Failed to get usage stats',
//         error: 'GET_STATS_FAILED',
//       };
//     }
//   }
// }

// export default DedaService;


import prisma from '../lib/prisma.js';
import type { ServiceResponse } from '../types/index.js';

// ============================================================================
// DEDA AI CHAT SERVICE — Powered by Claude
// ============================================================================

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const USAGE_LIMITS = {
  free:       { messagesPerDay: 10,   tokensPerMessage: 1000 },
  pro:        { messagesPerDay: 100,  tokensPerMessage: 4000 },
  enterprise: { messagesPerDay: 1000, tokensPerMessage: 8000 },
} as const;

const SYSTEM_PROMPT = `You are DEDA, an AI business assistant for MyBizTools, a platform designed for African entrepreneurs.

Your role is to:
1. Provide practical business advice tailored to the African market
2. Help with business planning, strategy, and growth
3. Assist with financial calculations and analysis
4. Offer guidance on marketing, sales, and customer relationships
5. Help with Nigerian tax regulations and compliance
6. Provide templates and frameworks for common business tasks

Important guidelines:
- Be concise and practical in your responses
- Consider the local Nigerian/African business context
- Use Naira (₦) for currency examples
- Be encouraging and supportive
- If asked about specific legal or financial advice, recommend consulting professionals
- Keep responses focused and actionable

Remember: You're helping small and medium business owners succeed.`;

// ── Formatters ──────────────────────────────────────────────────────────────

const formatConversation = (c: any) => ({
  id:           c.id,
  userId:       c.userId,
  title:        c.title,
  context:      c.context ?? null,
  messageCount: c.messageCount ?? 0,
  tokenUsage:   c.tokenUsage ?? 0,
  isArchived:   c.isArchived,
  createdAt:    c.createdAt?.toISOString() ?? null,
  updatedAt:    c.updatedAt?.toISOString() ?? null,
});

const formatMessage = (m: any) => ({
  id:         m.id,
  role:       m.role,
  content:    m.content,
  tokensUsed: m.tokensUsed ?? null,
  feedback:   m.feedback ?? null,
  createdAt:  m.createdAt?.toISOString() ?? null,
});

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface ChatInput {
  userId: string;
  conversationId?: string;
  message: string;
  context?: string;
}

// ============================================================================

export class DedaService {
  // --------------------------------------------------------------------------
  // CHAT
  // --------------------------------------------------------------------------

  static async chat(input: ChatInput): Promise<ServiceResponse> {
    const { userId, conversationId, message, context } = input;

    if (!ANTHROPIC_API_KEY) {
      return {
        success: false,
        message: 'AI service is not configured. Please add ANTHROPIC_API_KEY to your environment.',
        error: 'API_NOT_CONFIGURED',
      };
    }

    // Resolve user plan + limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentPlan: true },
    }) as any;

    const plan = (user?.currentPlan ?? 'free') as keyof typeof USAGE_LIMITS;
    const limits = USAGE_LIMITS[plan] ?? USAGE_LIMITS.free;

    // Daily usage check
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMessages = await prisma.chatMessage.count({
      where: {
        conversation: { userId },
        role: 'user',
        createdAt: { gte: today },
      },
    });

    if (todayMessages >= limits.messagesPerDay) {
      return {
        success: false,
        message: `You've reached your daily limit of ${limits.messagesPerDay} messages. Upgrade your plan for more.`,
        error: 'DAILY_LIMIT_REACHED',
      };
    }

    // Get or create conversation
    let conversation: any = null;

    if (conversationId) {
      conversation = await prisma.chatConversation.findFirst({
        where: { id: conversationId, userId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
    }

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          userId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          context,
        },
        include: { messages: true },
      });
    }

    // Build Claude message history (reverse desc → chronological)
    const history = [...(conversation.messages ?? [])].reverse();
    const claudeMessages = [
      ...history.map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    // Call Claude API
    const apiResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: limits.tokensPerMessage,
        system: context
          ? `${SYSTEM_PROMPT}\n\nAdditional context about the user's business:\n${context}`
          : SYSTEM_PROMPT,
        messages: claudeMessages,
      }),
    });

    if (!apiResponse.ok) {
      const errBody = await apiResponse.json().catch(() => ({}));
      console.error('[DedaService] Claude API error:', apiResponse.status, errBody);
      return { success: false, message: 'Failed to get response from AI', error: 'API_ERROR' };
    }

    const apiData = await apiResponse.json() as {
      content?: { text?: string }[];
      usage?: { output_tokens?: number };
    };

    const assistantResponse = apiData.content?.[0]?.text
      ?? 'I apologize, but I could not generate a response.';
    const tokensUsed = apiData.usage?.output_tokens ?? 0;

    // Persist messages + update conversation stats in a transaction
    await prisma.$transaction([
      prisma.chatMessage.create({
        data: { conversationId: conversation.id, role: 'user', content: message },
      }),
      prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: assistantResponse,
          tokensUsed,
        },
      }),
      prisma.chatConversation.update({
        where: { id: conversation.id },
        data: {
          messageCount: { increment: 2 },
          tokenUsage:   { increment: tokensUsed },
        },
      }),
    ]);

    return {
      success: true,
      message: 'Response generated successfully',
      data: {
        response: assistantResponse,
        conversationId: conversation.id,
        tokensUsed,
      },
    };
  }

  // --------------------------------------------------------------------------
  // GET CONVERSATIONS
  // --------------------------------------------------------------------------

  static async getConversations(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<ServiceResponse> {
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      prisma.chatConversation.findMany({
        where: { userId, isArchived: false },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          messageCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.chatConversation.count({ where: { userId, isArchived: false } }),
    ]);

    return {
      success: true,
      message: 'Conversations retrieved successfully',
      data: {
        conversations: (conversations as any[]).map(formatConversation),
        pagination: { current: page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  }

  // --------------------------------------------------------------------------
  // GET CONVERSATION MESSAGES
  // --------------------------------------------------------------------------

  static async getConversationMessages(
    userId: string,
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<ServiceResponse> {
    const conversation = await prisma.chatConversation.findFirst({
      where: { id: conversationId, userId },
    }) as any;

    if (!conversation) {
      return { success: false, message: 'Conversation not found', error: 'CONVERSATION_NOT_FOUND' };
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        select: { id: true, role: true, content: true, feedback: true, createdAt: true },
      }),
      prisma.chatMessage.count({ where: { conversationId } }),
    ]);

    return {
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        conversation: {
          id:      conversation.id,
          title:   conversation.title,
          context: conversation.context ?? null,
        },
        messages: (messages as any[]).map(formatMessage),
        pagination: { current: page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  }

  // --------------------------------------------------------------------------
  // ARCHIVE CONVERSATION
  // --------------------------------------------------------------------------

  static async archiveConversation(userId: string, conversationId: string): Promise<ServiceResponse> {
    const conversation = await prisma.chatConversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      return { success: false, message: 'Conversation not found', error: 'CONVERSATION_NOT_FOUND' };
    }

    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { isArchived: true },
    });

    return { success: true, message: 'Conversation archived successfully' };
  }

  // --------------------------------------------------------------------------
  // DELETE CONVERSATION
  // --------------------------------------------------------------------------

  static async deleteConversation(userId: string, conversationId: string): Promise<ServiceResponse> {
    const conversation = await prisma.chatConversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      return { success: false, message: 'Conversation not found', error: 'CONVERSATION_NOT_FOUND' };
    }

    await prisma.chatConversation.delete({ where: { id: conversationId } });
    return { success: true, message: 'Conversation deleted successfully' };
  }

  // --------------------------------------------------------------------------
  // PROVIDE FEEDBACK
  // --------------------------------------------------------------------------

  static async provideFeedback(
    userId: string,
    messageId: string,
    feedback: 'helpful' | 'not_helpful'
  ): Promise<ServiceResponse> {
    const msg = await prisma.chatMessage.findFirst({
      where: { id: messageId, conversation: { userId } },
    });

    if (!msg) {
      return { success: false, message: 'Message not found', error: 'MESSAGE_NOT_FOUND' };
    }

    await prisma.chatMessage.update({
      where: { id: messageId },
      data: { feedback },
    });

    return { success: true, message: 'Feedback recorded successfully' };
  }

  // --------------------------------------------------------------------------
  // GET USAGE STATS
  // --------------------------------------------------------------------------

  static async getUsageStats(userId: string): Promise<ServiceResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentPlan: true },
    }) as any;

    const plan = (user?.currentPlan ?? 'free') as keyof typeof USAGE_LIMITS;
    const limits = USAGE_LIMITS[plan] ?? USAGE_LIMITS.free;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayMessages, totalStats] = await Promise.all([
      prisma.chatMessage.count({
        where: { conversation: { userId }, role: 'user', createdAt: { gte: today } },
      }),
      prisma.chatConversation.aggregate({
        where: { userId },
        _sum: { messageCount: true, tokenUsage: true },
        _count: true,
      }),
    ]);

    return {
      success: true,
      message: 'Usage stats retrieved successfully',
      data: {
        plan,
        limits,
        usage: {
          messagesUsedToday:      todayMessages,
          messagesRemainingToday: Math.max(0, limits.messagesPerDay - todayMessages),
          totalConversations:     totalStats._count,
          totalMessages:          totalStats._sum.messageCount ?? 0,
          totalTokens:            totalStats._sum.tokenUsage ?? 0,
        },
      },
    };
  }
}

export default DedaService;