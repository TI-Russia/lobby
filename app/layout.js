import Script from "next/script";
import Footer from "./footer";
import { Header } from "./header";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RB4VVKFKG4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag() {
            dataLayer.push(arguments);
          }
          gtag("js", new Date());
          gtag("config", "G-RB4VVKFKG4");
        `}
        </Script>
        <script>
          {`
            <!-- Yandex.Metrika counter -->
                (function (d, w, c) {
                    (w[c] = w[c] || []).push(function() {
                        try {
                            w.yaCounter51964349 = new Ya.Metrika({
                                id:51964349,
                                clickmap:true,
                                trackLinks:true,
                                accurateTrackBounce:true
                            });
                        } catch(e) { }
                    });

                    var n = d.getElementsByTagName("script")[0],
                        x = "https://mc.yandex.ru/metrika/watch.js",
                        s = d.createElement("script"),
                        f = function () { n.parentNode.insertBefore(s, n); };
                    for (var i = 0; i < document.scripts.length; i++) {
                        if (document.scripts[i].src === x) { return; }
                    }
                    s.type = "text/javascript";
                    s.async = true;
                    s.src = x;

                    if (w.opera == "[object Opera]") {
                        d.addEventListener("DOMContentLoaded", f, false);
                    } else { f(); }
                })(document, window, "yandex_metrika_callbacks");
            <!-- /Yandex.Metrika counter -->
            `}
        </script>
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/51964349"
              style="position:absolute; left:-9999px;"
              alt=""
            />
          </div>
        </noscript>
        <script
          async
          src="https://use.fontawesome.com/releases/v5.15.1/js/all.js"
        ></script>
      </head>
      <body>
        <Header pageType={"duma_8"} />
        {children}
        <Footer pageType="duma" />
      </body>
    </html>
  );
}
