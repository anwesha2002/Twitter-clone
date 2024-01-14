import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
    getById : publicProcedure
        .input(z.object({
            id : z.string()
        })).query(async({input:{id}, ctx})=>{
            const currentUserId = ctx.session?.user.id

            const profile = await ctx.db.user.findUnique({
                where : {id},
                select : {
                    name : true,
                    image : true,
                    _count : {select : { tweets : true, follows : true, followers : true }},
                    followers :
                        currentUserId === null ? undefined : {where : { id : currentUserId } }

                }
            });

            if(profile === null) return

            return {
                name : profile.name,
                image : profile.image,
                followCount : profile._count.follows,
                followersCount : profile._count.followers,
                tweetCount : profile._count.tweets,
                isFollowing : profile.followers.length > 0
            }
        })
});
