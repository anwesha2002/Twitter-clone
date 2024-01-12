import InfiniteScroll from "react-infinite-scroll-component";
import {fetchData} from "next-auth/client/_utils";
import Link from "next/link";
import {ProfileImage} from "~/Component/ProfileImage";
import {VscHeart, VscHeartFilled} from "react-icons/vsc";
import {useSession} from "next-auth/react";
import {IconHoverEffect} from "~/Component/IconHoverEffect";
import {api} from "~/utils/api";

type Tweet = {
    id : string,
    content : string,
    createdAt : Date,
    likesCount : number,
    user: {  id: string; name: string | null; image: string | null; };
    likedByMe: boolean;
}

type InfiniteTweetListProps = {
    tweets? : Tweet[],
    isLoading : boolean,
    isError : boolean,
    hasMore : boolean | undefined ,
    fetchNewTweets : () => Promise<unknown>
}
export function InfiniteTweetList({tweets,isError, isLoading, fetchNewTweets, hasMore = false} : InfiniteTweetListProps){
    if(isLoading) return <h1>Loading</h1>
    if(isError) return <h1>Error</h1>
    if(tweets == null || tweets.length === 0) return (
        <div className="px-4 py-2">No Tweets</div>
    )

    return(
        <ul>
            <InfiniteScroll
                dataLength={tweets.length}
                next={fetchNewTweets}
                hasMore={hasMore}
                loader={<h4>Loading</h4>}
            >
                {tweets.map(data=><TweetCard {...data} />)}
            </InfiniteScroll>
        </ul>
    )
}

function dateTimeFormatter(date : Date){
    return Intl.DateTimeFormat(undefined,{
        dateStyle : "short"
    }).format(date)
}

function TweetCard({id, content, createdAt, likesCount, likedByMe, user} : Tweet){
    const TrpcUtils = api.useUtils()

    const toggleLikes = api.tweet.toggleLikes.useMutation({onSuccess : ({addedLikes}  ) =>{
        const updatedData : Parameters<typeof TrpcUtils.tweet.InfiniteFeed.setInfiniteData>[1] = (oldData) => {
            if(oldData == null ) return

                const countModifier = addedLikes ? 1 : -1;

                return {
                    ...oldData,
                    pages : oldData.pages.map((page)=>{
                        return{
                            ...page,
                            tweets: page.tweets.map((tweet)=>{
                                if(tweet.id === id){
                                    return{
                                        ...tweet,
                                        likesCount : tweet.likesCount + countModifier,
                                        likedByMe : addedLikes
                                    }
                                }

                                return tweet
                            })
                        }
                    })
                }
        }

        TrpcUtils.tweet.InfiniteFeed.setInfiniteData({}, updatedData)
    }})

    function handleToggleLikes(){
        toggleLikes.mutate({id})
    }

    return(
        <li className="flex gap-4 border-b px-4 py-4">
            <Link href={`/profiles/${user.id}`}>
                <ProfileImage src={user.image}/>
            </Link>
            <div className="flex flex-col flex-grow">
                <div className="flex gap-1">
                    <Link href={`/profiles/${user.id}`} className="font-bold hover:underline outline-none focus-visible:underline">
                        {user.name}
                    </Link>
                    <span className="text-gray-500">-</span>
                    <span className="text-gray-500">
                        {dateTimeFormatter(createdAt)}
                    </span>
                </div>
                <p className="whitespace-pre-wrap ">{content}</p>
                <HeartButton isLoading={toggleLikes.isLoading} onClick={handleToggleLikes} likedByMe={likedByMe} LikesCount={likesCount}/>
            </div>
        </li>
    )
}

type heartButtonProps = {
    likedByMe : boolean,
    LikesCount : number,
    onClick : () => void,
    isLoading : boolean
}

function HeartButton({isLoading, onClick, likedByMe, LikesCount} : heartButtonProps){
    const HeartIcon = likedByMe ? VscHeartFilled : VscHeart
    const session =useSession()

    if(session.status !== "authenticated"){
        return (
            <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500 -ml-2">
                <HeartIcon/>
                <span>{LikesCount}</span>
            </div>
        )
    }

    return (
        <button disabled={isLoading} onClick={onClick} className={`group flex items-center self-start transition-colors duration-200 ${likedByMe ? "text-red-500 -ml-2" : "text-gray-500 hover:text-red-500 focus-visible:text-red-500 -ml-2"}`} >
            <IconHoverEffect red>
                <HeartIcon className={`transition-colors duration-200 ${likedByMe ? "fill-red-500 " : "fill-gray-500 group-focus-visible:fill-red-500 group-hover:fill-red-500"}`}/>
            </IconHoverEffect>
            <span>{LikesCount}</span>
        </button>
    )
}