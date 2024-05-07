import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

interface PageUpdate {
  pageId: string;
  newStatus: string;
  date?: string;
  websiteStatus?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: Socket;
  private endpoint = environment.apiUrl;

  constructor() {
    this.socket = io(this.endpoint);
  }

  connectToWebsite(websiteId: string) {
    this.socket.emit('view_website', websiteId);
  }

  onWebsiteUpdate(callback: (data: any) => void) {
    this.socket.on('website_updated', callback);
  }

  onPageUpdate(callback: (data: PageUpdate) => void) {
    this.socket.on('page_updated', callback);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
