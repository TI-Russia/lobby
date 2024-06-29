"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const Burger = ({ pageType, config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDuma8 = pageType === "duma_8";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div id="nav-menu" className={isOpen ? "is-active" : ""}>
        <Link href={`${config.baseUrl}/${config.menuAboutUrl[pageType]}`}>
          О&nbsp;проекте
        </Link>
        {isDuma8 && (
          <a
            href={config.researchUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Исследование
          </a>
        )}
        <Link href={`${config.baseUrl}/${config.pageUrls.stories}`}>
          Истории
        </Link>
        <Link href={`${config.baseUrl}/${config.pageUrls.contribute}`}>
          Помочь проекту
        </Link>
        <a
          href={config.feedbackUrl[pageType]}
          target="_blank"
          rel="noopener noreferrer"
        >
          Обратная связь
        </a>
      </div>
      <a
        id="nav-toggle"
        className={isOpen ? "is-active is-visible" : ""}
        onClick={toggleNav}
      >
        <span className="icon">
          <i className="fas fa-bars"></i>
        </span>
      </a>
      <ul
        className={`header-menu ${isOpen ? "is-visible" : ""}`}
        id="header_menu"
      >
        <li>
          <Link href={`${config.baseUrl}/${config.menuAboutUrl[pageType]}`}>
            О&nbsp;проекте
          </Link>
        </li>
        {isDuma8 && (
          <li>
            <a
              href={config.researchUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Исследование
            </a>
          </li>
        )}
        <li>
          <Link href={`${config.baseUrl}/${config.pageUrls.stories}`}>
            Истории
          </Link>
        </li>
        <li>
          <Link href={`${config.baseUrl}/${config.pageUrls.contribute}`}>
            Помочь проекту
          </Link>
        </li>
        <li>
          <a
            href={config.feedbackUrl[pageType]}
            target="_blank"
            rel="noopener noreferrer"
          >
            Обратная связь
          </a>
        </li>
      </ul>
    </>
  );
};

export default Burger;
