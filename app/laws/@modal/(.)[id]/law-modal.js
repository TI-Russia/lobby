"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import { LawView } from "@/ui/law-view";

export default function LawModal({ lawData }) {
  const router = useRouter();

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div className={styles.modal} onClick={() => router.back()}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button onClick={() => router.back()} className={styles.closeButton}>
          ✕
        </button>
        <LawView lawData={lawData} />
      </div>
    </div>
  );
}
