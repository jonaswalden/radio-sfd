export function navigateToUrl (url) {
  return navigate(url);
}

export function navigateToDomString (domString) {
  const blob = new Blob([domString], {type: 'text/html'});
  const url = URL.createObjectURL(blob);
  return navigate(url);
}

function navigate (src) {
  console.log('navigate', src);
  const appFrame = document.getElementById('app-frame');
  appFrame.removeAttribute('src');
  appFrame.src = src;

  return new Promise((resolve) => {
    appFrame.addEventListener('load', () => resolve(Browser()), {once: true});
  });

  function Browser () {
    console.log(appFrame.contentDocument.documentElement);
    return {
      window: appFrame.contentWindow,
      document: appFrame.contentDocument,
    };
  }
}
