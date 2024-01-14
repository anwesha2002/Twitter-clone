import type {GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage} from "next";
import Head from "next/head";
import {ssgHelper} from "~/server/api/ssgHelper";
import {api} from "~/utils/api";
import ErrorPage from "next/error";
import {IconHoverEffect} from "~/Component/IconHoverEffect";
import {VscArrowLeft} from "react-icons/vsc";
import Link from "next/link";
import {ProfileImage} from "~/Component/ProfileImage";


const ProfilePages : NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({id}) => {

    const {data : profile} = api.profile.getById.useQuery({id})

    if(profile == null || profile.name === null) return <ErrorPage statusCode={404}/>


    return (
        <>
            <Head>
                <title>{`Twitter clone - ${profile.name}`}</title>
            </Head>
            <header className="sticky top-0 flex items-center border-b bg-white px-4 py-2">
                <Link href=".." className="mr-2">
                    <IconHoverEffect>
                        <VscArrowLeft className="w-6 h-6"/>
                    </IconHoverEffect>
                </Link>
                <ProfileImage src={profile.image} className="flex-shrink-0"/>
                <div className="ml-2 flex-grow">
                    <h1 className="text-lg font-bold">{profile.name}</h1>
                    <div className="text-gray-500">
                        {profile.tweetCount}{" "}
                        {SingularPlural(profile.tweetCount,"Tweet", "Tweets")} - {" "}
                        {profile.followersCount}{" "}
                        {SingularPlural(profile.followersCount,"follower", "followers")} - {" "}
                        {profile.followCount}{" "} Following
                    </div>
                </div>
            </header>
        </>
    )
}

const pluralRules = new Intl.PluralRules
function SingularPlural(number : number, singular : string, plural : string){
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

