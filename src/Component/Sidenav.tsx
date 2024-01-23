import Link from "next/link";
import {signIn, signOut, useSession} from "next-auth/react";
import {IconHoverEffect} from "~/Component/IconHoverEffect";
import {VscAccount, VscHome, VscSignIn, VscSignOut} from "react-icons/vsc";


export function Sidenav(){
    const session = useSession()
    const user = session.data?.user

    return(
        <nav className="sticky  top-0 px-2 py-4">
            <ul className="flex flex-col items-start whitespace-nowrap">
                <li><Link href="/">
                    <IconHoverEffect>
                        <span className="flex gap-4 items-center">
                            <VscHome className="w-8 h-8 "/>
                            <span className="hidden text-lg md:inline">Home</span>
                        </span>
                    </IconHoverEffect>
                </Link></li>
                {(user) &&
                    <li><Link href={`/profiles/${user.id}`}>
                        <IconHoverEffect>
                        <span className="flex gap-4 items-center">
                            <VscAccount className="w-8 h-8 "/>
                            <span className="hidden text-lg md:inline">Profile</span>
                        </span>
                        </IconHoverEffect>
                    </Link></li>
                }
                {
                    user == null ? <li><button onClick={()=>{void signIn()}}>
                        <IconHoverEffect>
                        <span className="flex gap-4 items-center">
                            <VscSignIn className="w-8 h-8 fill-green-700"/>
                            <span className="hidden text-lg md:inline text-green-700">Log In</span>
                        </span>
                        </IconHoverEffect>
                    </button></li> : <li><button onClick={()=>{void signOut()}}>
                        <IconHoverEffect>
                        <span className="flex gap-4 items-center">
                            <VscSignOut className="w-8 h-8 fill-red-700"/>
                            <span className="hidden text-lg md:inline text-red-700">Log Out</span>
                        </span>
                        </IconHoverEffect>
                    </button></li>
                }
            </ul>
        </nav>
    )
}