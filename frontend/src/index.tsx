import 'bootstrap/dist/css/bootstrap.min.css';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from './app';
import { AppProviders } from './context';
import * as serviceWorker from './serviceWorker';






declare global {
  // tslint:disable-next-line
  interface Window {
    blockies: any;
  }
}
//loadDevTools(() => {
  ReactDOM.render(
    <>
        <AppProviders>
          <App />
        </AppProviders>
    </>,
    document.getElementById("root"),
  )
//});


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
