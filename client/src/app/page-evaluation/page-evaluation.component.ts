import { Component } from '@angular/core';
import { Page } from 'src/types/Page';
import { PagesService } from '../services/pages.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-page-evaluation',
  templateUrl: './page-evaluation.component.html',
  styleUrls: ['./page-evaluation.component.scss']
})
export class PageEvaluationComponent {
  pageId: string;
  evaluation: any;
  page?: Page;
  isLoading = true;
  rules = this._formBuilder.group({
    act: true,
    wcag: true,
  });
  results = this._formBuilder.group({
    passed: true,
    failed: true,
    inapplicable: true,
    warning: true,
  });
  levels = this._formBuilder.group({
    a: true,
    aa: true,
    aaa: true,
  });

  constructor(
    private pagesService: PagesService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private _formBuilder: FormBuilder,
  ) {
    this.pageId = this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit() {
    this.fetchEvaluation();
  }

  fetchEvaluation() {
    this.pagesService.getPageEvaluation(this.pageId).subscribe({
      next: response => {
        if (response.success) {
          this.evaluation = response.evaluation;
          this.page = response.page;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'An error occurred fetching the evaluation.',
          });
        }
        this.isLoading = false;
      },
      error: error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An error occurred fetching the evaluation.',
        });
        this.isLoading = false;
      }
    });
  }

}
