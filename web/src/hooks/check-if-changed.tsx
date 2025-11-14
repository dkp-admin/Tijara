import { useEffect } from "react";
import { useRouter } from "next/router";

const useWarnIfUnsavedChanges = (props: string) => {
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      if (localStorage.getItem(`isChangein${props}`) === "true") {
        event.preventDefault();
        event.returnValue = "";
        return "";
      }
    };

    const handleRouteChangeStart = (url: any) => {
      console.log("URL");

      if (
        localStorage.getItem(`isChangein${props}`) === "true" &&
        !confirm(
          "Are you sure you want to leave? Your changes may not be saved."
        )
      ) {
        router.events.emit("routeChangeError");
        throw `Route change to "${url}" was aborted (this error can be safely ignored).`;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [router]);
};

export default useWarnIfUnsavedChanges;
