"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import { LawView } from "@/ui/law-view";

export default function LawModal({ lawData }) {
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    // Блокируем скролл
    document.documentElement.style.overflow = "hidden";

    // Добавляем обработчик Escape
    const handleEscape = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      // Восстанавливаем скролл и убираем обработчик
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handleClose]);

  return (
    <div className={styles.modal} onClick={handleClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} className={styles.closeButton}>
          ✕
        </button>
        <LawView
          lawData={lawData}
          onNavigate={handleClose} // Добавляем проп для закрытия модалки при навигации
        />
      </div>
    </div>
  );
}
