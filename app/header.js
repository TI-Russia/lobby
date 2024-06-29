import Link from "next/link";
import HeaderSelector from "./header-selector";
import "../_sass/common.scss";

// Конфигурационный объект для URL и других настроек
const config = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "",
  logoRedirect: {
    sf: "sf",
    about_sf: "sf",
    duma_7: "duma_7",
    duma_8: "duma_8",
  },
  menuAboutUrl: {
    sf: "about-sf",
    about_sf: "about-sf",
    duma_7: "about",
    duma_8: "about",
  },
  pageUrls: {
    contribute: "contribute",
  },
  feedbackUrl: {
    sf: "https://feedback-sf-url.com",
    about_sf: "https://feedback-sf-url.com",
    duma_7: "https://feedback-duma-url.com",
    duma_8: "https://feedback-duma-url.com",
  },
  researchUrl: "https://research-url.com",
};

export function Header({ pageType }) {
  const logoSrc = `/assets/images/logo/logo-${
    pageType === "sf" || pageType === "about_sf"
      ? "sf"
      : pageType === "duma_7"
      ? "7"
      : "8"
  }.svg`;
  const logoAlt = "Лоббизм";
  const noLogoSrc = `/assets/images/logo/lobbism_no_logo.svg`;

  const isDuma8 = pageType === "duma_8";
  const isDuma7 = pageType === "duma_7";
  const isSF = pageType === "sf" || pageType === "about_sf";

  return (
    <header className="hero-head">
      <div className="columns is-mobile">
        <div className="column c1" id="header-title">
          <Link href={`${config.baseUrl}/${config.logoRedirect[pageType]}`}>
            {isSF || isDuma7 || isDuma8 ? (
              <img className="logo" src={logoSrc} alt={logoAlt} />
            ) : (
              <img className="no-logo" src={noLogoSrc} alt={logoAlt} />
            )}
          </Link>
          <HeaderSelector selectedPage={pageType} />
        </div>
        <div className="column c2">
          <h2>
            {isSF ? (
              <>
                <span>Какие сенаторы служат</span>
                <br />
                <span>не только народу</span>
              </>
            ) : (
              <>
                <span>Какие депутаты служат</span>
                <br />
                <span>не только народу</span>
              </>
            )}
          </h2>
        </div>
        <div className="column is-pulled-right c3">
          <div id="nav-menu" className="">
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
          <a id="nav-toggle" className="">
            <span className="icon">
              <i className="fas fa-bars"></i>
            </span>
          </a>
          <ul className="header-menu" id="header_menu">
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
        </div>
        <div className="column is-pulled-right c4">
          <a
            href={`http://vk.com/share.php?url=https%3A%2F%2Fdumabingo.ru%2F${
              isSF ? "sf" : ""
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className="c4 vk_share_button"
          >
            <span className="icon is-large">
              <i className="fab fa-vk"></i>
            </span>
          </a>
        </div>
        <div className="column is-pulled-right c5">
          <a
            href={`https://twitter.com/intent/tweet?url=https%3A%2F%2Fdumabingo.ru%2F${
              isSF ? "sf" : ""
            }&text=${encodeURIComponent("Описание для твита")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="c5"
          >
            <span className="icon is-large">
              <i className="fab fa-twitter"></i>
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
