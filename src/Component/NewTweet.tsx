import {Button} from "~/Component/Button";
import {ProfileImage} from "~/Component/ProfileImage";
import {useSession} from "next-auth/react";
import {FormEvent, useCallback, useLayoutEffect, useRef, useState} from "react";
import {api} from "~/utils/api";

function updateTextAreaSize(textArea? : HTMLTextAreaElement){
    if(textArea == null) return
    textArea.style.height = "0"
    textArea.style.height = `${textArea.scrollHeight}px`
}


export function NewTweet(){
    const session = useSession()
    if(session.status !== "authenticated") return null;
    return <Form/>
}

function Form(){
    const session = useSession()
    const [inputValue, setInputValue] = useState("")
    const textAreaRef = useRef<HTMLTextAreaElement>()
    const inputRef = useCallback((textArea : HTMLTextAreaElement)=>{
        updateTextAreaSize(textArea)
        textAreaRef.current = textArea
    },[])

    useLayoutEffect(()=>{
        updateTextAreaSize(textAreaRef.current)
    },[inputValue])

    const Trlpcutil = api.useUtils()

    const createTweet = api.tweet.create.useMutation({
        onSuccess : (newTweet) => {
            setInputValue("")

            if(session.status !== "authenticated") return

            Trlpcutil.tweet.InfiniteFeed.setInfiniteData({}, (oldData) => {
                if(oldData == null || oldData.pages[0] == null) return;

                const newChachedTweet = {
                    ...newTweet,
                    likesCount : 0,
                    likedByMe : false,
                    user : {
                        id : session.data.user.id,
                        name : session.data.user.name || null,
                        image : session.data.user.image || null
                    }
                }

                return {
                    ...oldData,
                    pages : [
                        {
                            ...oldData.pages[0],
                            tweets : [newChachedTweet, ...oldData.pages[0].tweets]
                        },
                        ...oldData.pages.slice(1)
                    ]
                }
            })
        }
    })

    function handleSubmit(e : FormEvent){
        e.preventDefault()
        createTweet.mutate({content : inputValue})
    }

    if(session.status !== "authenticated") return null


    return(
        <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-b px-4 py-2">
                <div className="flex gap-4">
                    <ProfileImage src={session.data.user.image}/>
                    <textarea
                        className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
                        placeholder="What's happening?"
                        ref={inputRef}
                        value={inputValue}
                        onChange={e=> setInputValue(e.target.value)}
                        style={{height : "0"}}
                    />
                </div>
                <Button className="self-end" >Tweet</Button>
            </form>
        </>
    )
}