import { Component } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { FormControl, Validators } from '@angular/forms';
import { WebsiteService } from '../services/website.service';
import { Router } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { ValidatorFn, AbstractControl } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('slideInOut', [
      state('stepOne', style({ transform: 'translateX(0%)' })),
      state('stepTwo', style({ transform: 'translateX(0%)' })),

      transition('stepOne => stepTwo', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)' })),
      ]),

      transition('stepTwo => stepOne', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)' })),
      ]),
    ]),
  ],
})
export class HomeComponent {
  url = new FormControl('', [
    Validators.required,
    Validators.pattern('^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(\\/[^\\s]*)?$'),
  ]);
  pageInput = new FormControl('', [
    Validators.pattern('^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(\\/[^\\s]*)?$'),
    this.subpageValidator(),
  ]);
  pages: string[] = [];
  currentStep = 'stepOne';
  wbesiteId?: string;
  protocol = 'https://';

  constructor(
    private websiteService: WebsiteService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.url.valueChanges.subscribe(value => {
      if (value && value.startsWith('https://')) {
        this.url.setValue(value.replace('https://', ''), { emitEvent: false });
        this.protocol = 'https://';
      } else if (value && value.startsWith('http://')) {
        this.url.setValue(value.replace('http://', ''), { emitEvent: false });
        this.protocol = 'http://';
      }
    });

    this.pageInput.valueChanges.subscribe(value => {
      if (value && value.startsWith(this.protocol)) {
        this.pageInput.setValue(value.replace(this.protocol, ''), {
          emitEvent: false,
        });
      }
    });
  }

  switchProtocol() {
    this.protocol = this.protocol === 'https://' ? 'http://' : 'https://';
  }

  previousStep() {
    this.currentStep = 'stepOne';
    this.url.reset();
    this.pages = [];
    this.wbesiteId = undefined;
  }

  nextStep() {
    if (!this.url.valid) return;
    this.websiteService
      .createWebsite(this.protocol + this.url.value)
      .subscribe({
        next: response => {
          if (response.success) {
            this.wbesiteId = response.website._id;
            this.currentStep = 'stepTwo';
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Website added successfully',
            });
            this.currentStep = 'stepTwo';
          } else {
            if (response.message) {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message,
              });
              if (response.errors) {
                response.errors.forEach((error: any) => {
                  if (error.field === 'url') {
                    this.url.setErrors({ invalidUrl: true });
                  }
                });
              }
            }
          }
        },
        error: error => {
          if (error.error.message) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error.message,
            });
          }

          if (error.error.errors) {
            error.error.errors.forEach((error: any) => {
              if (error.field === 'url') {
                this.url.setErrors({ invalidUrl: true });
              }
            });
          }
        },
      });
  }

  removePage(page: string) {
    this.pages = this.pages.filter(p => p !== page);
  }

  onPageInput() {}

  addPage() {
    if (this.pageInput.value === null || this.pageInput.value.trim() === '') {
      this.pageInput.setErrors({ requiredField: true });
      return;
    }

    if (!this.pageInput.valid) return; // Check if input is valid
    if (this.pages.includes(this.pageInput.value)) return; // Check if input is already in the list
    this.pages = [...this.pages, this.protocol + this.pageInput.value];
    this.pageInput.reset();
  }

  done() {
    if (this.pages.length === 0)
      this.router.navigate(['/websites/', this.wbesiteId]);

    if (this.pages.length > 0) {
      this.websiteService
        .addPagesToWebsite(this.wbesiteId!, this.pages)
        .subscribe({
          next: response => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Pages added successfully',
              });
              this.router.navigate(['/websites/', this.wbesiteId]);
            } else {
              if (response.message) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: response.message,
                });
              }
            }
          },
          error: error => {
            if (error.error.message) {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error.error.message,
              });
            }
          },
        });
    }
  }

  isSubPage(parent: string | null, page: string) {
    if (!parent) return false;

    return (
      page.startsWith(parent) &&
      page !== parent &&
      parent !== page + '/' &&
      page !== parent + '/'
    );
  }

  subpageValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value && !this.isSubPage(this.url.value, control.value)) {
        return { invalidSubpage: true };
      }
      return null;
    };
  }
}
