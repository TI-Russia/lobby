"use client";

import { LawView } from "@/ui/law-view";
import styles from "./page.module.scss";
import { useMediaQuery } from "@uidotdev/usehooks";

export function LawPageClient({ lawData }) {
  const isTablet = useMediaQuery("(max-width: 768px)");

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LawView
          className={styles.lawView}
          lawData={lawData}
          expandedAccordion={isTablet}
        />
      </div>
    </div>
  );
}
