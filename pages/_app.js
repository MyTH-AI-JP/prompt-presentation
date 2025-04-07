import React from 'react';

// これはApp Routerがあるため、実際には使用されません
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp; 