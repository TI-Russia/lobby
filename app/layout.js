import Footer from "./footer";
import { Header } from "./header";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
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
