import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Head from "next/head";
import {Sidenav} from "~/Component/Sidenav";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Twitter clone</title>
          <meta
              name="description"
              content="this is a twitter clone"
          />
          <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container items-start flex mx-auto sm:pr-3">
          <Sidenav/>
          <div className="min-h-screen flex-grow border-x">
              <Component {...pageProps} />
          </div>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
