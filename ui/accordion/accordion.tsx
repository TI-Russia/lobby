"use client";

import { useState } from "react";
import styles from "./accordion.module.scss";
import clsx from "clsx";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function Accordion({
  title,
  children,
  defaultExpanded = false,
}: AccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={clsx(styles.accordion, {
        [styles.accordion_expand]: isExpanded,
      })}
    >
      <div
        className={styles.accordionTitle}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {title}
      </div>
      <div className={styles.accordionContent}>
        <div>
          <div className={styles.inner}>{children}</div>
        </div>
      </div>
    </div>
  );
}
