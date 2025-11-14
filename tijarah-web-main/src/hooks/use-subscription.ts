import { useState, useEffect } from "react";

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const storedSubscription = localStorage.getItem("subscription");

    if (storedSubscription) {
      try {
        const parsedSubscription = JSON.parse(storedSubscription);
        setSubscription(parsedSubscription);
      } catch (error) {
        console.error("Error parsing subscription from localStorage:", error);
      }
    }
  }, []);

  return subscription;
}
