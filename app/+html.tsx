import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every
 * web page during static rendering.
 * The contents of this function only run in Node.js environments and
 * do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* 
          This resets the default browser styles for ScrollView to match React Native's ScrollView.
          It removes the scrollbars and sets the body to overflow: hidden.
        */}
        <ScrollViewStyleReset />

        {/* Add Material Icons Font from Google Fonts CDN */}
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

        {/* Using raw CSS to hide the splash screen immediately on web to avoid flickering */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { background-color: #fff; }
          @font-face {
            font-family: 'MaterialIcons';
            src: url(https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
          }
          @font-face {
            font-family: 'Ionicons';
            src: url(https://unpkg.com/ionicons@5.5.2/dist/fonts/ionicons.ttf) format('truetype');
          }
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
