const Footer = ({ pageType }) => {
  const isStateDuma = pageType !== "sf";

  return (
    <footer className="footer">
      <div className="columns is-vcentered is-mobile">
        <div className="column social is-narrow is-hidden-desktop">
          <a
            href="http://vk.com/share.php?url=https%3A%2F%2Fdumabingo.org%2F"
            target="_blank"
            rel="noopener noreferrer"
            className="vk vk_share_button"
          >
            <span className="icon">
              <i className="fab fa-vk"></i>
            </span>
          </a>
          <a
            href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fdumabingo.org%2F&text={{site.meta.description[page.type]}}"
            target="_blank"
            rel="noopener noreferrer"
            className="tw"
          >
            <span className="icon">
              <i className="fab fa-twitter"></i>
            </span>
          </a>
        </div>
        <div className="column copy">
          Источники: сайт&nbsp;
          {isStateDuma ? (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="http://duma.gov.ru"
              title="Сайт Госдумы"
            >
              Госдумы
            </a>
          ) : (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="http://council.gov.ru"
              title="Сайт Совета Федерации"
            >
              Совета Федерации
            </a>
          )}
          ,<wbr />
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://sozd.duma.gov.ru/"
            title="Сайт СОЗД"
          >
            СОЗД
          </a>
          ,<wbr /> собственное исследование
        </div>
        <div className="column copy is-pulled-right has-text-right is-narrow-desktop contact-email">
          По любым вопросам пишите на почту
          <br />
          <a href="mailto:info@dumabingo.org" title="Написать на почту">
            info@dumabingo.org
          </a>
        </div>
      </div>
      <div className="extra agent columns is-multiline" data-nosnippet>
        <div className="is-full is-size-7">
          <p>
            На портале используются термины, предусмотренные соответствующими
            российскими федеральными конституционными законами в отношении
            отдельных территорий на полуострове Крым, вокруг реки Днепр и у
            Азовского моря. Использование этих терминов не означает выражения
            отношения к международно-правовому статусу территорий.
          </p>
          <p>
            Этот сайт не содержит утверждений о совершении упомянутыми в нем
            лицами преступлений, правонарушений и нечестных поступков, об их
            неправильном, неэтичном поведении в личной, общественной или
            политической жизни. Мы никого не обвиняем в недобросовестности при
            осуществлении производственно-хозяйственной и предпринимательской
            деятельности, нарушении деловой этики или обычаев делового оборота.
            Авторы предприняли все усилия, чтобы проверить содержащиеся в этом
            докладе сведения. Сервис «ДумаБинго» не несет ответственность за
            использование и интерпретацию этих сведений третьими лицами.
          </p>
          <p>
            * Дельность организации Meta Inc, владеющей Инстаграм и Фейсбук, на
            территории России запрещена по основаниям осуществления
            экстремистской деятельности.
          </p>
          <p>
            ** НО "Фонд борьбы с коррупцией" решением суда признана
            экстремистской в РФ, ее деятельность запрещена
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
