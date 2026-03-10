// /**
//  * Social Media Planner Service
//  * Manage social media posts and scheduling
//  */

// import prisma from '../lib/prisma.js';

// export interface CreatePostInput {
//   userId: string;
//   content: string;
//   mediaUrls?: string[];
//   platforms: string[];
//   scheduledAt?: Date;
// }

// export interface UpdatePostInput {
//   content?: string;
//   mediaUrls?: string[];
//   platforms?: string[];
//   scheduledAt?: Date;
// }

// const VALID_PLATFORMS = ['twitter', 'facebook', 'instagram', 'linkedin', 'tiktok'];

// export class SocialService {
//   /**
//    * Create a new social media post
//    */
//   static async createPost(input: CreatePostInput) {
//     try {
//       const { userId, content, mediaUrls, platforms, scheduledAt } = input;

//       // Validate platforms
//       const invalidPlatforms = platforms.filter(p => !VALID_PLATFORMS.includes(p));
//       if (invalidPlatforms.length > 0) {
//         return {
//           success: false,
//           message: `Invalid platforms: ${invalidPlatforms.join(', ')}`,
//           error: 'INVALID_PLATFORMS',
//         };
//       }

//       const status = scheduledAt ? 'scheduled' : 'draft';

//       const post = await prisma.socialPost.create({
//         data: {
//           user_id: userId,
//           content,
//           media_urls: mediaUrls || [],
//           platforms,
//           scheduled_at: scheduledAt,
//           status,
//         },
//       });

//       return {
//         success: true,
//         message: 'Post created successfully',
//         data: { post },
//       };
//     } catch (error) {
//       console.error('Create post error:', error);
//       return {
//         success: false,
//         message: 'Failed to create post',
//         error: 'CREATE_POST_FAILED',
//       };
//     }
//   }

//   /**
//    * Get user's posts
//    */
//   static async getPosts(
//     userId: string,
//     options: {
//       page?: number;
//       limit?: number;
//       status?: string;
//       platform?: string;
//     } = {}
//   ) {
//     try {
//       const { page = 1, limit = 20, status, platform } = options;
//       const skip = (page - 1) * limit;

//       const where: any = { user_id: userId };
//       if (status) where.status = status;
//       if (platform) where.platforms = { has: platform };

//       const [posts, total] = await Promise.all([
//         prisma.socialPost.findMany({
//           where,
//           orderBy: { created_at: 'desc' },
//           skip,
//           take: limit,
//         }),
//         prisma.socialPost.count({ where }),
//       ]);

//       return {
//         success: true,
//         data: {
//           posts,
//           pagination: {
//             current: page,
//             limit,
//             total,
//             pages: Math.ceil(total / limit),
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Get posts error:', error);
//       return {
//         success: false,
//         message: 'Failed to retrieve posts',
//         error: 'GET_POSTS_FAILED',
//       };
//     }
//   }

//   /**
//    * Get post by ID
//    */
//   static async getPostById(userId: string, postId: string) {
//     try {
//       const post = await prisma.socialPost.findFirst({
//         where: {
//           id: postId,
//           user_id: userId,
//         },
//       });

//       if (!post) {
//         return {
//           success: false,
//           message: 'Post not found',
//           error: 'POST_NOT_FOUND',
//         };
//       }

//       return {
//         success: true,
//         data: { post },
//       };
//     } catch (error) {
//       console.error('Get post error:', error);
//       return {
//         success: false,
//         message: 'Failed to retrieve post',
//         error: 'GET_POST_FAILED',
//       };
//     }
//   }

//   /**
//    * Update post
//    */
//   static async updatePost(userId: string, postId: string, input: UpdatePostInput) {
//     try {
//       const post = await prisma.socialPost.findFirst({
//         where: {
//           id: postId,
//           user_id: userId,
//         },
//       });

//       if (!post) {
//         return {
//           success: false,
//           message: 'Post not found',
//           error: 'POST_NOT_FOUND',
//         };
//       }

//       // Can only edit drafts or scheduled posts
//       if (!['draft', 'scheduled'].includes(post.status)) {
//         return {
//           success: false,
//           message: 'Cannot edit a published or failed post',
//           error: 'CANNOT_EDIT',
//         };
//       }

//       const updateData: any = {};
//       if (input.content) updateData.content = input.content;
//       if (input.mediaUrls) updateData.media_urls = input.mediaUrls;
//       if (input.platforms) updateData.platforms = input.platforms;
//       if (input.scheduledAt !== undefined) {
//         updateData.scheduled_at = input.scheduledAt;
//         updateData.status = input.scheduledAt ? 'scheduled' : 'draft';
//       }

//       const updatedPost = await prisma.socialPost.update({
//         where: { id: postId },
//         data: updateData,
//       });

//       return {
//         success: true,
//         message: 'Post updated successfully',
//         data: { post: updatedPost },
//       };
//     } catch (error) {
//       console.error('Update post error:', error);
//       return {
//         success: false,
//         message: 'Failed to update post',
//         error: 'UPDATE_POST_FAILED',
//       };
//     }
//   }

//   /**
//    * Delete post
//    */
//   static async deletePost(userId: string, postId: string) {
//     try {
//       const post = await prisma.socialPost.findFirst({
//         where: {
//           id: postId,
//           user_id: userId,
//         },
//       });

//       if (!post) {
//         return {
//           success: false,
//           message: 'Post not found',
//           error: 'POST_NOT_FOUND',
//         };
//       }

//       await prisma.socialPost.delete({
//         where: { id: postId },
//       });

//       return {
//         success: true,
//         message: 'Post deleted successfully',
//       };
//     } catch (error) {
//       console.error('Delete post error:', error);
//       return {
//         success: false,
//         message: 'Failed to delete post',
//         error: 'DELETE_POST_FAILED',
//       };
//     }
//   }

//   /**
//    * Get scheduled posts for a date range
//    */
//   static async getScheduledPosts(userId: string, startDate: Date, endDate: Date) {
//     try {
//       const posts = await prisma.socialPost.findMany({
//         where: {
//           user_id: userId,
//           status: 'scheduled',
//           scheduled_at: {
//             gte: startDate,
//             lte: endDate,
//           },
//         },
//         orderBy: { scheduled_at: 'asc' },
//       });

//       return {
//         success: true,
//         data: {
//           posts,
//           count: posts.length,
//         },
//       };
//     } catch (error) {
//       console.error('Get scheduled posts error:', error);
//       return {
//         success: false,
//         message: 'Failed to get scheduled posts',
//         error: 'GET_SCHEDULED_FAILED',
//       };
//     }
//   }

//   /**
//    * Get post analytics summary
//    */
//   static async getAnalytics(userId: string) {
//     try {
//       const stats = await prisma.socialPost.aggregate({
//         where: { user_id: userId, status: 'published' },
//         _sum: {
//           likes: true,
//           shares: true,
//           comments: true,
//           reach: true,
//         },
//         _count: true,
//       });

//       const byPlatform = await prisma.socialPost.groupBy({
//         by: ['platforms'],
//         where: { user_id: userId },
//         _count: true,
//       });

//       const byStatus = await prisma.socialPost.groupBy({
//         by: ['status'],
//         where: { user_id: userId },
//         _count: true,
//       });

//       return {
//         success: true,
//         data: {
//           analytics: {
//             total_posts: stats._count,
//             total_likes: stats._sum.likes || 0,
//             total_shares: stats._sum.shares || 0,
//             total_comments: stats._sum.comments || 0,
//             total_reach: stats._sum.reach || 0,
//             by_status: byStatus.map(s => ({
//               status: s.status,
//               count: s._count,
//             })),
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Get analytics error:', error);
//       return {
//         success: false,
//         message: 'Failed to get analytics',
//         error: 'GET_ANALYTICS_FAILED',
//       };
//     }
//   }
// }

// export default SocialService;


import prisma from '../lib/prisma.js';
import type { ServiceResponse } from '../types/index.js';

// ============================================================================
// SOCIAL MEDIA PLANNER SERVICE
// ============================================================================

export interface CreatePostInput {
  userId: string;
  content: string;
  mediaUrls?: string[];
  platforms: string[];
  scheduledAt?: Date;
}

export interface UpdatePostInput {
  content?: string;
  mediaUrls?: string[];
  platforms?: string[];
  scheduledAt?: Date;
}

const VALID_PLATFORMS = ['twitter', 'facebook', 'instagram', 'linkedin', 'tiktok'];

const formatPost = (post: any) => ({
  id: post.id,
  content: post.content,
  mediaUrls: post.mediaUrls,
  platforms: post.platforms,
  status: post.status,
  scheduledAt: post.scheduledAt?.toISOString() ?? null,
  likes: post.likes,
  shares: post.shares,
  comments: post.comments,
  reach: post.reach,
  createdAt: post.createdAt?.toISOString() ?? null,
  updatedAt: post.updatedAt?.toISOString() ?? null,
});

export class SocialService {
  // --------------------------------------------------------------------------
  // CREATE POST
  // --------------------------------------------------------------------------

  static async createPost(input: CreatePostInput): Promise<ServiceResponse> {
    const { userId, content, mediaUrls, platforms, scheduledAt } = input;

    const invalidPlatforms = platforms.filter((p) => !VALID_PLATFORMS.includes(p));
    if (invalidPlatforms.length > 0) {
      return {
        success: false,
        message: `Invalid platforms: ${invalidPlatforms.join(', ')}. Must be one of: ${VALID_PLATFORMS.join(', ')}`,
        error: 'INVALID_PLATFORMS',
      };
    }

    const post = await prisma.socialPost.create({
      data: {
        userId,
        content,
        mediaUrls: mediaUrls ?? [],
        platforms,
        scheduledAt,
        status: scheduledAt ? 'scheduled' : 'draft',
      },
    });

    return {
      success: true,
      message: 'Post created successfully',
      data: { post: formatPost(post) },
    };
  }

  // --------------------------------------------------------------------------
  // GET POSTS
  // --------------------------------------------------------------------------

  static async getPosts(
    userId: string,
    options: { page?: number; limit?: number; status?: string; platform?: string } = {}
  ): Promise<ServiceResponse> {
    const { page = 1, limit = 20, status, platform } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) where.status = status;
    if (platform) where.platforms = { has: platform };

    const [posts, total] = await Promise.all([
      prisma.socialPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.socialPost.count({ where }),
    ]);

    return {
      success: true,
      message: 'Posts retrieved successfully',
      data: {
        posts: (posts as any[]).map(formatPost),
        pagination: {
          current: page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  // --------------------------------------------------------------------------
  // GET POST BY ID
  // --------------------------------------------------------------------------

  static async getPostById(userId: string, postId: string): Promise<ServiceResponse> {
    const post = await prisma.socialPost.findFirst({
      where: { id: postId, userId },
    });

    if (!post) {
      return { success: false, message: 'Post not found', error: 'POST_NOT_FOUND' };
    }

    return {
      success: true,
      message: 'Post retrieved successfully',
      data: { post: formatPost(post) },
    };
  }

  // --------------------------------------------------------------------------
  // UPDATE POST
  // --------------------------------------------------------------------------

  static async updatePost(
    userId: string,
    postId: string,
    input: UpdatePostInput
  ): Promise<ServiceResponse> {
    const post = await prisma.socialPost.findFirst({
      where: { id: postId, userId },
    });

    if (!post) {
      return { success: false, message: 'Post not found', error: 'POST_NOT_FOUND' };
    }

    if (!['draft', 'scheduled'].includes(post.status)) {
      return {
        success: false,
        message: 'Cannot edit a published or failed post',
        error: 'CANNOT_EDIT',
      };
    }

    const updateData: any = {};
    if (input.content)    updateData.content   = input.content;
    if (input.mediaUrls)  updateData.mediaUrls = input.mediaUrls;
    if (input.platforms)  updateData.platforms = input.platforms;
    if (input.scheduledAt !== undefined) {
      updateData.scheduledAt = input.scheduledAt;
      updateData.status = input.scheduledAt ? 'scheduled' : 'draft';
    }

    const updatedPost = await prisma.socialPost.update({
      where: { id: postId },
      data: updateData,
    });

    return {
      success: true,
      message: 'Post updated successfully',
      data: { post: formatPost(updatedPost) },
    };
  }

  // --------------------------------------------------------------------------
  // DELETE POST
  // --------------------------------------------------------------------------

  static async deletePost(userId: string, postId: string): Promise<ServiceResponse> {
    const post = await prisma.socialPost.findFirst({
      where: { id: postId, userId },
    });

    if (!post) {
      return { success: false, message: 'Post not found', error: 'POST_NOT_FOUND' };
    }

    await prisma.socialPost.delete({ where: { id: postId } });
    return { success: true, message: 'Post deleted successfully' };
  }

  // --------------------------------------------------------------------------
  // GET SCHEDULED POSTS
  // --------------------------------------------------------------------------

  static async getScheduledPosts(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ServiceResponse> {
    const posts = await prisma.socialPost.findMany({
      where: {
        userId,
        status: 'scheduled',
        scheduledAt: { gte: startDate, lte: endDate },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return {
      success: true,
      message: 'Scheduled posts retrieved successfully',
      data: {
        posts: (posts as any[]).map(formatPost),
        count: posts.length,
      },
    };
  }

  // --------------------------------------------------------------------------
  // GET ANALYTICS
  // --------------------------------------------------------------------------

  static async getAnalytics(userId: string): Promise<ServiceResponse> {
    const [stats, byStatus] = await Promise.all([
      prisma.socialPost.aggregate({
        where: { userId, status: 'published' },
        _sum: { likes: true, shares: true, comments: true, reach: true },
        _count: true,
      }),
      prisma.socialPost.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
    ]);

    return {
      success: true,
      message: 'Analytics retrieved successfully',
      data: {
        analytics: {
          totalPosts: stats._count,
          totalLikes: stats._sum.likes ?? 0,
          totalShares: stats._sum.shares ?? 0,
          totalComments: stats._sum.comments ?? 0,
          totalReach: stats._sum.reach ?? 0,
          byStatus: (byStatus as any[]).map((s) => ({
            status: s.status,
            count: s._count,
          })),
        },
      },
    };
  }
}

export default SocialService;