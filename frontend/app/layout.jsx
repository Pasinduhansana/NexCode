import AppProviders from "./providers";
import "@/src/index.css";

export const metadata = {
  title: "NexCode | Software Development",
  description: "NexCode Software Development - Custom Solutions. Modern Technology. Real Results.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/assets/Logo.webp" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-TMK2FJK46Z" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TMK2FJK46Z');
            `,
          }}
        />
      </head>
      <body>
        <div id="root">
          <AppProviders>{children}</AppProviders>
        </div>
      </body>
    </html>
  );
}
