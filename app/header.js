import Link from "next/link";
import HeaderSelector from "./header-selector";
import "../_sass/common.scss";
import Burger from "../ui/burger/burger";

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
  metaDescription: {
    sf: "Мы рассказываем о сенаторах Совета Федерации, которые служат не только народу",
    about_sf:
      "Мы рассказываем о сенаторах Совета Федерации, которые служат не только народу",
    duma_7:
      "Мы рассказываем о депутатах Государственной Думы, которые служат не только народу",
    duma_8:
      "Мы рассказываем о депутатах Государственной Думы, которые служат не только народу",
  },
};

export function Header({ pageType }) {
  const isSF = pageType === "sf" || pageType === "about_sf";
  const isDuma8 = pageType === "duma_8";

  return (
    <header className="hero-head">
      <div className="columns is-mobile">
        <div className="column c1" id="header-title">
          <Link href={`${config.baseUrl}/${config.logoRedirect[pageType]}`}>
            {(pageType === "sf" || pageType === "about_sf") && (
              <img
                className="logo"
                src={`${config.baseUrl}/assets/images/logo/logo-sf.svg`}
                alt="Лоббизм"
              />
            )}
            {pageType === "duma_7" && (
              <img
                className="logo"
                src={`${config.baseUrl}/assets/images/logo/logo-7.svg`}
                alt="Лоббизм"
              />
            )}
            {(pageType === "duma_8" || pageType === "contribute") && (
              <img
                className="logo"
                src={`${config.baseUrl}/assets/images/logo/logo-8.svg`}
                alt="Лоббизм"
              />
            )}
            <img
              className="no-logo"
              src={`${config.baseUrl}/assets/images/logo/lobbism_no_logo.svg`}
              alt="Лоббизм"
            />
          </Link>
          <HeaderSelector selectedPage={pageType} />
        </div>
        <div className="column c2">
          <h2>
            Какие {isSF ? "сенаторы" : "депутаты"} служат <br />
            не только народу
          </h2>
        </div>
        <div className="column is-pulled-right c3">
          <Burger pageType={pageType} config={config} />
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
            }&text=${encodeURIComponent(config.metaDescription[pageType])}`}
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
