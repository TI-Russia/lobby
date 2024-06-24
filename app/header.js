import "../_sass/common.scss";
import HeaderSelector from "./header-selector";

export function Header({ site, page }) {
  const logoSrc = `/assets/images/logo/logo-${
    page.type === "sf" || page.type === "about_sf"
      ? "sf"
      : page.type === "duma_7"
      ? "7"
      : "8"
  }.svg`;
  const logoAlt = "Лоббизм";
  const noLogoSrc = `/assets/images/logo/lobbism_no_logo.svg`;

  const isDuma8 = page.type === "duma_8";
  const isDuma7 = page.type === "duma_7";
  const isSF = page.type === "sf" || page.type === "about_sf";

  return (
    <header className="hero-head">
      <div className="columns is-mobile">
        <div className="column c1" id="header-title">
          <a href="{{site.url}}/{{site.logo_redirect[page.type]}}">
            {isSF ? (
              <img className="logo" src={logoSrc} alt={logoAlt} />
            ) : isDuma7 ? (
              <img className="logo" src={logoSrc} alt={logoAlt} />
            ) : isDuma8 ? (
              <img className="logo" src={logoSrc} alt={logoAlt} />
            ) : (
              <img className="no-logo" src={noLogoSrc} alt={logoAlt} />
            )}
            <img className="no-logo" src={noLogoSrc} alt="Лоббизм" />
          </a>
          <HeaderSelector selectedPage={page.type} />
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
            <a href="{{ site.baseurl }}/{{ site.menu_about_url[page.type] }}">
              О&nbsp;проекте
            </a>
            {isDuma8 && (
              <a href={site.research_url} target="_blank">
                Исследование
              </a>
            )}
            <a href="{{ site.baseurl }}/{{ site.page_urls.contribute }}">
              Помочь проекту
            </a>
            <a target="_blank" href="{{ site.feedback_url[page.type] }}">
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
              <a href="{{ site.baseurl }}/{{ site.menu_about_url[page.type] }}">
                О&nbsp;проекте
              </a>
            </li>
            {isDuma8 && (
              <li>
                <a href={site.research_url} target="_blank">
                  Исследование
                </a>
              </li>
            )}
            <li>
              <a href="{{ site.baseurl }}/{{ site.page_urls.contribute }}">
                Помочь проекту
              </a>
            </li>
            <li>
              <a target="_blank" href="{{ site.feedback_url[page.type] }}">
                Обратная связь
              </a>
            </li>
          </ul>
        </div>
        <div className="column is-pulled-right c4">
          <a
            href="http://vk.com/share.php?url=https%3A%2F%2Fdumabingo.ru%2F{% if page.type == 'sf'%}sf{%endif%}"
            target="_blank"
            className="c4 vk_share_button"
          >
            <span className="icon is-large">
              <i className="fab fa-vk"></i>
            </span>
          </a>
        </div>
        <div className="column is-pulled-right c5">
          <a
            href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fdumabingo.ru%2F{% if page.type == 'sf'%}sf{%endif%}&text={{site.meta.description[page.type]}}"
            target="_blank"
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
