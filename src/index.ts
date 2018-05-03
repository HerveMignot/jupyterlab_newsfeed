import {
  JupyterLab, JupyterLabPlugin, ILayoutRestorer
} from '@jupyterlab/application';
import {
  ICommandPalette, InstanceTracker
} from '@jupyterlab/apputils';
import {
  JSONExt
} from '@phosphor/coreutils';
import {
  Widget
} from '@phosphor/widgets';
import {
  Message
} from '@phosphor/messaging';

import '../style/index.css';


class HNWidget extends Widget {
  constructor() {
    super();
    this.id = 'hn-jupyterlab';
    this.title.label = 'Hacker News';
    this.title.closable = true;
    this.addClass('jp-hnWidget');
    this.div = document.createElement('div');
    this.node.appendChild(this.div);
  }
  readonly div: HTMLDivElement;

  onUpdateRequest(msg: Message): void {
    this.div.innerHTML='<h1>Hacker News</h1>';
    fetch('https://hn.algolia.com/api/v1/search?tags=front_page').then(response => {
      return response.json();
    }).then(data => {
      data.hits.forEach((element:any) => {
        console.log(element);
        this.div.innerHTML+= `<div style="display: flex"><span style="width: 50%"><a href="${element.url}" target="_blank">
          ${element.title}</a></span><span style="width: 20%">
         ${element.author} </span>  ${new Date(element.created_at).toLocaleString()}</div>`
      });
    });
  }
}


/**
 * Initialization data for the jupyterlab_hackernews extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_hackernews',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: activate,
};

function activate(app: JupyterLab, palette: ICommandPalette, restorer: ILayoutRestorer){
  let widget: HNWidget;
  // Add an application command
  const command: string = 'hackernews:open';
  app.commands.addCommand(command, {
    label: 'Hacker News',
    execute: () => {
      if (!widget) {
        widget = new HNWidget();
        widget.update();
      }
      if (!tracker.has(widget)) {
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        // Attach the widget to the main work area if it's not there
        app.shell.addToMainArea(widget);
      } else{
        widget.update();
      }
      // Activate the widget
      app.shell.activateById(widget.id);
    }
  });

  // Add the command to the palette.
  palette.addItem({ command, category: 'Fun!' });

  let tracker = new InstanceTracker<Widget>({ namespace: 'hackernews' });
  restorer.restore(tracker, {
    command,
    args: () => JSONExt.emptyObject,
    name: ()=> 'hackernews'
  });
  console.log('JupyterLab extension jupyterlab_hn is activated!');
  console.log('ICommandPalette:', palette);
}

export default extension;
