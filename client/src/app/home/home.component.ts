import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('slideInOut', [
      state('stepOne', style({ transform: 'translateX(0%)' })),
      state('stepTwo', style({ transform: 'translateX(0%)' })),

      transition('stepOne => stepTwo', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)' }))
      ]),

      transition('stepTwo => stepOne', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)' }))
      ])
    ])
  ]
})
export class HomeComponent {
  url: string;
  firstStep: boolean;
  pages: string[];
  currentStep = "stepOne"

  constructor() {
    this.url = ''
    this.firstStep = true
    this.pages = [
      // Dummy urls
      'https://www.example.com',
      'https://www.example.com/about',
      'https://www.example.com/contact'
    ]
  }

  previousStep() {
    this.firstStep = true
    this.currentStep = "stepOne"
    this.url = ''
    this.pages = [
      // Dummy urls
      'https://www.example.com',
      'https://www.example.com/about',
      'https://www.example.com/contact'
    ]
  }

  nextStep() {
    this.currentStep = "stepTwo"
    this.firstStep = false
  }

  removePage(page: string) {
    this.pages = this.pages.filter(p => p !== page)
  }

  done() {}
}
