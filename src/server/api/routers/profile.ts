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
        }))
        .query(async({input:{id}, ctx})=>{
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
        }),
    toggleFollow : protectedProcedure
        .input(z.object({
            userId : z.string()
        }))
        .mutation(async ({ctx, input:{ userId }})=> {
            const currentUserId  = ctx.session.user.id

            const existingFollow = await ctx.db.user.findFirst({where : {
                id : userId, followers : { some : { id : currentUserId}}
            }})

            let addedFollower

            if(existingFollow === null){
                await ctx.db.user.update({
                    where : {id : userId},
                    data : { followers : { connect : { id : currentUserId }} }
                })
                addedFollower = true
            }else {
                await ctx.db.user.update({
                    where : {id : userId},
                    data : { followers : { disconnect : { id : currentUserId }} }
                })
                addedFollower = false
            }

            void ctx.revalidateSSG?.(`/profiles/${userId}`)
            void ctx.revalidateSSG?.(`/profiles/${currentUserId}`)

            return {addedFollower}
        })
});
