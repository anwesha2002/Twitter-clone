import Image from "next/image";
import {VscAccount} from "react-icons/vsc";

type ProfileImageProps = {
    className? : string,
    src? : string | null
}
export function ProfileImage({className = "", src} : ProfileImageProps){
    return(
        <>
          <div className={`relative rounded-full overflow-hidden h-12 w-12 ${className}`}>
              {src != null ? <Image src={src} alt="profile picture" quality="100" fill/> : <VscAccount className="h-full w-full"/>}
          </div>
        </>
    )
}