import Footer from "./footer";
import { Header } from "./header";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header pageType={"duma_8"} />
        {children}
        <Footer pageType="duma" />
      </body>
    </html>
  );
}
