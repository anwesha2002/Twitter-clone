import {NewTweet} from "~/Component/NewTweet";
import {InfiniteTweetList} from "~/Component/InfiniteTweetList";
import {Tweet} from ".prisma/client";
import {api} from "~/utils/api";
import {useSession} from "next-auth/react";
import {useState} from "react";

const TABS = ["Recent" , "Following"] as const

export default function Home() {

    const session = useSession()
    const [selectedTabs , setSelectedTabs] = useState<typeof TABS[number]>("Recent")

    return (
   <>
     <header className="sticky top-0 z-10 border-b-2 pt-2 bg-white">
        <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
     </header>
       <NewTweet/>
       {
           session.status === "authenticated" && (
               <div className="flex" >{TABS.map(tab=>{
                   return <button key={tab} className={` flex-grow p-2 hover:bg-gray-200 focus-visible:bg-gray-200 ${tab === selectedTabs ? "border-b-4 border-b-blue-500 font-bold" : "" }`} onClick={()=>{setSelectedTabs(tab)}}>{tab}</button>
               })}</div>
           )
       }
       <RecentTweet/>
   </>
  );
}

function RecentTweet(){
    const tweets = api.tweet.InfiniteFeed.useInfiniteQuery(
        {},
        {getNextPageParam : (lastPage) => lastPage.nextCursor}
    )

    return(
        <InfiniteTweetList
            tweets={tweets.data?.pages.flatMap(data=>data.tweets)}
            isError={tweets.isError}
            isLoading={tweets.isLoading}
            hasMore={tweets.hasNextPage}
            fetchNewTweets={tweets.fetchNextPage}
        />
    )
}


