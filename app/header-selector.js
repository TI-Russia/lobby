"use client";
import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";

const HeaderSelector = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const headerSelectorRef = useRef(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        headerSelectorRef.current &&
        !headerSelectorRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      id="header-selector"
      className={clsx("selector-control", {
        "selector-control_open": isOpen,
      })}
      ref={headerSelectorRef}
      onClick={toggleOpen}
    >
      <div className="selector-list">
        {[
          {
            type: "duma_8",
            href: "/",
            alt: "в думе 8 созыва",
            src: "/assets/images/logo/vgosdume-8.svg",
          },
          {
            type: "duma_7",
            href: "/sozyv7",
            alt: "в думе 7 созыва",
            src: "/assets/images/logo/vgosdume-7.svg",
          },
          {
            type: "sf",
            href: "/sf",
            alt: "в совете федерации",
            src: "/assets/images/logo/vsovfede.svg",
          },
        ].map((item, index) => (
          <a
            key={index}
            className={clsx(`item-${item.type.replace("_", "-")}`, {
              selected: props.selectedPage === item.type,
            })}
            href={item.href}
            alt={item.alt}
          >
            <img src={item.src} alt={item.alt} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default HeaderSelector;
