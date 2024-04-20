import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormControl, Validators } from '@angular/forms';
import { WebsiteService } from '../services/website.service';
import { Router } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { ValidatorFn, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
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
  url = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(\\/[^\\s]*)?$')])
  pageInput = new FormControl('', [Validators.pattern('^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(\\/[^\\s]*)?$'), this.subpageValidator()])
  pages: string[] = []
  currentStep = "stepOne"


  constructor(private websiteService: WebsiteService, private router: Router) {

  }

  ngOnInit() {
    this.url.valueChanges.subscribe(value => {
      if (value && value.startsWith('https://')) {
        this.url.setValue(value.replace('https://', ''), { emitEvent: false });
      }
    });

    this.pageInput.valueChanges.subscribe(value => {
      if (value && value.startsWith('https://')) {
        this.pageInput.setValue(value.replace('https://', ''), { emitEvent: false });
      }
    })
  }

  previousStep() {
    this.currentStep = "stepOne"
    this.url.reset()
    this.pages = []
  }

  nextStep() {
    if (!this.url.valid) return
    this.currentStep = "stepTwo"
  }

  removePage(page: string) {
    this.pages = this.pages.filter(p => p !== page)
  }

  onPageInput() {
  }

  addPage() {
    if (this.pageInput.value === null || this.pageInput.value.trim() === '') {
      this.pageInput.setErrors({ requiredField: true });
      return;
  }

    if (!this.pageInput.valid) return // Check if input is valid
    if (this.pages.includes(this.pageInput.value)) return // Check if input is already in the list
    this.pages = [...this.pages, 'https://' + this.pageInput.value]
    this.pageInput.reset()



  }

  done() {
      this.websiteService.createWebsite('https://' + this.url.value, this.pages).subscribe({
        next: (website) => {
          // TODO: Handle the response

          this.router.navigate(['/websites/', website._id]);

            },
        error: (error) => {
          // TODO: Handle the error
        }
      });
  }


  isSubPage(parent: string|null, page: string) {
    if (!parent) return false

    return page.startsWith(parent) && page !== parent && parent !== page + '/' && page !== parent + '/'
  }

  subpageValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {

      if (control.value && !this.isSubPage(this.url.value, control.value)) {
        return { invalidSubpage: true }
      }
      return null
    };
  }

}
