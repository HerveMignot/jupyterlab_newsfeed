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
    this.page = 1;

    let previousButton = document.createElement('button');
    previousButton.className = 'jp-hn-buttons';
    previousButton.innerText = "Previous Page";
    previousButton.onclick = ()=>this.modifyPage(this.page-1);

    let nextButton = document.createElement('button');
    nextButton.className = 'jp-hn-buttons';
    nextButton.onclick = ()=>this.modifyPage(this.page +1);
    nextButton.innerText = "Next Page";

    let buttons = document.createElement('div');    
    buttons.appendChild(previousButton);
    buttons.appendChild(nextButton);
    buttons.style.display = 'flex';
    buttons.style.justifyContent = 'space-between'

    this.warning = document.createElement('h2');
    this.warning.style.color = 'red';
    this.div.insertAdjacentElement('afterend', this.warning);
    this.div.insertAdjacentElement('afterend', buttons);
  }

  readonly div: HTMLDivElement;
  readonly warning: HTMLHeadingElement;
  page: number;

  fetchNews(){
    fetch(`http://hn.algolia.com/api/v1/search_by_date?tags=story&page=${this.page}`).then(response => {
      return response.json();
    }).then(data => {
      data.hits.forEach((element:any) => {
        console.log(element);
        this.div.innerHTML+= `<div class="jp-hn-news">
          <span style="width: 65%">
          <a href="${element.url}" target="_blank">${element.title}</a>
          </span>
          <span style="width: 15%">${element.author} </span> 
          <span style="width: 20%;text-align: right"> ${new Date(element.created_at).toLocaleString()}</span>
          </div>`
      });
    });
  }

  modifyPage(page: number){
    if(page < 1) {
      // this.warning.innerText += '<h3 style="color: red">This is the first page</h3>';
      this.warning.innerText = "This is already the first page :)";
      return;
    } else {
      this.warning.innerText = "";
      this.page = page;
      this.div.innerHTML='<h1>Hacker News</h1>';
      this.fetchNews()
    }
  }

  onUpdateRequest(msg: Message): void {
    this.div.innerHTML='<h1>Hacker News</h1>';
    this.fetchNews();
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
