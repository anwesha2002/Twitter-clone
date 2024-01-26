import type {GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage} from "next";
import Head from "next/head";
import {ssgHelper} from "~/server/api/ssgHelper";
import {api} from "~/utils/api";
import ErrorPage from "next/error";
import {IconHoverEffect} from "~/Component/IconHoverEffect";
import {VscArrowLeft} from "react-icons/vsc";
import Link from "next/link";
import {ProfileImage} from "~/Component/ProfileImage";
import {InfiniteTweetList} from "~/Component/InfiniteTweetList";
import {Button} from "~/Component/Button";
import {useSession} from "next-auth/react";


const ProfilePages : NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({id}) => {

    const {data : profile} = api.profile.getById.useQuery({id})
    const tweets = api.tweet.InfiniteProfileFeed.useInfiniteQuery(
        {userId: id},
        { getNextPageParam : (lastPage) => lastPage.nextCursor}
    )
    const trpcUtils = api.useUtils()

    const toggleFollow = api.profile.toggleFollow.useMutation({
        onSuccess : ({addedFollower}) => {
            const updateData : Parameters<typeof trpcUtils.profile.getById.setData>[1] = ( olddata ) =>{

                const countModifier = addedFollower ? +1 : -1

                if(olddata == null) return

                return{
                    ...olddata,
                    isFollowing : addedFollower,
                    followersCount : olddata.followersCount + countModifier
                }

            }

            trpcUtils.profile.getById.setData({id}, updateData)
        }
    })



        return(
        (profile == null || profile?.name == null) ?
             <ErrorPage statusCode={404}/> :

            <>
                <Head>
                    <title>{`Twitter clone - ${profile?.name}`}</title>
                </Head>
                <header className="sticky z-10 top-0 flex items-center border-b bg-white px-4 py-2">
                    <Link href=".." className="mr-2">
                        <IconHoverEffect>
                            <VscArrowLeft className="w-6 h-6"/>
                        </IconHoverEffect>
                    </Link>
                    <ProfileImage src={profile?.image} className="flex-shrink-0"/>
                    <div className="ml-2 flex-grow">
                        <h1 className="text-lg font-bold">{profile?.name}</h1>
                        <div className="text-gray-500">
                            {profile?.tweetCount}{" "}
                            {SingularPlural(profile?.tweetCount, "Tweet", "Tweets")} - {" "}
                            {profile?.followersCount}{" "}
                            {SingularPlural(profile?.followersCount, "follower", "followers")} - {" "}
                            {profile?.followCount}{" "} Following
                        </div>
                    </div>
                    <FollowButton
                        isFollowing={profile?.isFollowing}
                        userId={id}
                        onClick={() => {
                            toggleFollow.mutate({userId: id})
                        }}
                        isLoading={toggleFollow.isLoading}
                    />

                </header>
                <InfiniteTweetList
                    tweets={tweets.data?.pages.flatMap(data => data.tweets)}
                    isLoading={tweets.isLoading}
                    isError={tweets.isError}
                    hasMore={tweets.hasNextPage}
                    fetchNewTweets={tweets.fetchNextPage}/>
            </>
    )

}

export function FollowButton({ isFollowing, userId, onClick, isLoading} : {isFollowing : boolean, userId : string, onClick : () => void, isLoading : boolean}){
        const session = useSession()
        if( session.status === "unauthenticated" || session.data?.user.id === userId){
            return null
        }
    return(
        <Button disabled={isLoading} onClick={onClick} small gray={isFollowing}>
            {isFollowing ? "unfollow" : "Follow"}
        </Button>
    )
}

const pluralRules = new Intl.PluralRules
function SingularPlural(number : number , singular : string, plural : string){
    return pluralRules.select(number) === "one" ? singular : plural
}

export const getStaticPaths : GetStaticPaths = () => {
    return {
        paths: [],
        fallback : "blocking"
    }
}

export async function getStaticProps(context :GetStaticPropsContext<{id : string}>){
    const id = context.params?.id

    if(id == null){
        return {
            redirect : {
                destination : "/"
            }
        }
    }


    const ssg = ssgHelper()
    await ssg.profile.getById.prefetch({id})

    return {
        props : {
            trpcState : ssg.dehydrate(),
            id
        }
    }


}

export default ProfilePages

