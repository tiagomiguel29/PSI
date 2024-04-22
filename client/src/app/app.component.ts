import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'client';

  items: MenuItem[]; // Define menu items array
  // Mobile menu state
  mobileMenuActive: boolean;

  constructor() {
    this.items = [];
    this.mobileMenuActive = false;
  }

  // Toggle mobile menu
  toggleMobileMenu() {
    this.mobileMenuActive = !this.mobileMenuActive;
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        routerLink: ['/'],
      },
    ];
  }
}
