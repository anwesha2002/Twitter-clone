import { z } from "zod";

import {
    createTRPCContext,
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import {Prisma} from ".prisma/client";
import {inferAsyncReturnType} from "@trpc/server";

export const tweetRouter = createTRPCRouter({
  InfiniteFeed : publicProcedure
      .input(z.object({
          onlyFollowings : z.boolean().optional(),
          limit : z.number().optional(),
          cursor : z.object({id : z.string() , createdAt : z.date()}).optional()
      }))
      .query(
          async ({ ctx, input : {limit = 10, cursor, onlyFollowings = false} }) => {
              const currentUserId  = ctx.session?.user.id

              return await GetInfiniteTweet({limit,
                  cursor,
                  ctx,
                  whereClause:
                  currentUserId == null || !onlyFollowings ? undefined : {
                    user : {
                        followers : {
                            some : {
                                id : currentUserId
                            }
                        }
                    }
                  }
              })
          }
      ),
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ ctx, input : {content} }) => {
      // simulate a slow db call
      const tweet =  await ctx.db.tweet.create({
        data : {content, userId : ctx.session.user.id}
      })

      return tweet
    }),
  toggleLikes : protectedProcedure
      .input(z.object({id : z.string() }))
      .mutation(async ({input : { id }, ctx}) => {
        const data = { tweetId : id , userId : ctx.session.user.id };
        const existingLikes =  await ctx.db.like.findUnique({where : {
            userId_tweetId : data
            }
        })
        console.log(existingLikes)
          if(existingLikes == null){
              await ctx.db.like.create({data});
              return { addedLikes : true }
          }else{
              await ctx.db.like.delete({where : { userId_tweetId : data }});
              return {addedLikes : false}
          }
      }),
});

async function GetInfiniteTweet({limit , cursor, whereClause, ctx}:{whereClause? : Prisma.TweetWhereInput, ctx : inferAsyncReturnType<typeof createTRPCContext>, cursor : {id : string , createdAt : Date} | undefined, limit : number}){
    const currentUserId  = ctx.session?.user.id

    const data = await ctx.db.tweet.findMany({
        take : limit + 1,
        cursor : cursor ? { createdAt_id : cursor } : undefined,
        orderBy :[{createdAt : "desc"},{id : "desc"}],
        where : whereClause,
        select : {
            id : true,
            content: true,
            createdAt : true,
            _count : {select: {likes : true}},
            likes : currentUserId === null ? false : {where : { userId: currentUserId}},
            user : {
                select : {name : true, id: true, image : true}
            }
        }
    })

    let nextCursor : typeof cursor | undefined
    if(data.length > limit){
        const nextItem = data.pop()
        if(nextItem != null){
            nextCursor = { id : nextItem.id, createdAt: nextItem.createdAt }
        }
    }

    return {tweets : data.map(tweet=>{
            return {
                id : tweet.id,
                content : tweet.content,
                createdAt : tweet.createdAt,
                likesCount : tweet._count.likes,
                user : tweet.user,
                likedByMe : tweet.likes?.length > 0
            }
        }) , nextCursor}
}
