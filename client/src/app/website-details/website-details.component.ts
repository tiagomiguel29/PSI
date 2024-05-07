import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebsiteService } from '../services/website.service';
import { Page } from 'src/types/Page';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ValidatorFn, AbstractControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { PagesService } from '../services/pages.service';
import { MessageService } from 'primeng/api';
import { FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { WebsocketService } from '../services/websocket.service';

export interface NewPageDialogData {
  websiteId: string;
  pageUrl: FormControl;
  onCloseSuccess: Function;
  protocol: string;
  pageIds?: string[];
}

export interface DeleteWebsiteDialogData {
  websiteId: string;
  websiteUrl: string;
}

@Component({
  selector: 'app-website-details',
  templateUrl: './website-details.component.html',
  styleUrls: ['./website-details.component.scss'],
})
export class WebsiteDetailsComponent {
  _id: string;
  website: any;
  pages: Page[] = [];
  imageUrl?: string = '';
  imageLoading: boolean = true;
  protocol = 'https://';
  pageUrlToAdd = new FormControl('', [
    Validators.required,
    Validators.pattern('^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(\\/[^\\s]*)?$'),
    this.subpageValidator(),
  ]);
  statusOptions = [
    { value: 'all', viewValue: 'All' },
    { value: 'Pending evaluation', viewValue: 'Pending evaluation' },
    { value: 'Evaluating', viewValue: 'Evaluating' },
    { value: 'Compliant', viewValue: 'Compliant' },
    { value: 'Not compliant', viewValue: 'Not compliant' },
    { value: 'Evaluation error', viewValue: 'Evaluation error' },
  ];

  statusFormControl = new FormControl('all');

  displayedColumns: string[] = [
    'select',
    'url',
    'status',
    'createdAt',
    'lastEvaluated',
  ];
  dataSource = new MatTableDataSource<{}>(this.pages);

  selection = new SelectionModel<Page>(true, []);

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private route: ActivatedRoute,
    private websiteService: WebsiteService,
    private pagesService: PagesService,
    private messageService: MessageService,
    private websocketService: WebsocketService,
    public dialog: MatDialog
  ) {
    this._id = this.route.snapshot.paramMap.get('id')!;
  }

  @ViewChild(MatSort) sortComponent!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  checkboxLabel(row: Page): string {
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  handleEvaluatePages() {
    const pageIds = this.selection.selected.map(page => page._id);
    this.websiteService.evaluate(this._id, pageIds).subscribe({
      next: response => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Evaluation started successfully',
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to start evaluation',
          });
        }
        this.selection.clear();
      },
      error: error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message || 'Failed to start evaluation',
        });
        this.selection.clear();
      },
    });
  }

  openDeletePagesDialog(): void {
    const dialogRef = this.dialog.open(DeletePagesDialog, {
      data: {
        pageIds: this.selection.selected.map(page => page._id),
        websiteId: this.website._id,
        onCloseSuccess: this.fetchPages.bind(this),
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.selection.clear();
    });
  }

  fetchWebsite() {
    this.websiteService.getWebsiteById(this._id).subscribe({
      next: website => {
        this.website = website;
        if (website.previewImageStatus === 'Captured') {
          this.imageUrl = website.imageUrl;
          this.imageLoading = false;
        } else {
          this.imageLoading = true;
        }
        if (website.url?.startsWith('http://')) {
          this.protocol = 'http://';
        }
      },
      error: error => {
        console.error('Error fetching website:', error);
      },
    });
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.fetchPages(this.paginator.pageIndex + 1, this.paginator.pageSize);
    });

    this.sortComponent.sortChange.subscribe((sortState: Sort) => {
      this.fetchPages(
        this.paginator.pageIndex + 1,
        this.paginator.pageSize,
        sortState.active,
        sortState.direction
      );
    });
  }

  ngOnInit() {
    this.fetchWebsite();
    this.fetchPages();

    this.statusFormControl.valueChanges.subscribe(value => {
      if (value) {
        this.fetchPages(
          this.paginator.pageIndex + 1,
          this.paginator.pageSize,
          this.sortComponent.active,
          this.sortComponent.direction,
          value
        );
      }
    });

    this.pageUrlToAdd.valueChanges.subscribe(value => {
      if (value && value.startsWith(this.protocol)) {
        this.pageUrlToAdd.setValue(value.replace(this.protocol, ''), {
          emitEvent: false,
        });
      }
    });

    this.websocketService.connectToWebsite(this._id);
    this.websocketService.onWebsiteUpdate(() => {
      this.fetchWebsite();
      this.fetchPages();
    });

    // Subscribe to page updates an update the page status if the page is in the list
    this.websocketService.onPageUpdate(data => {
      if (data.websiteStatus) {
        this.website.status = data.websiteStatus;
      }

      const page = this.pages.find(page => page._id === data.pageId);
      if (page) {
        page.status = data.newStatus;
        if (data.date) {
          page.lastEvaluated = data.date;
        }
        this.dataSource.data = this.pages;
      }
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddPageDialog, {
      data: {
        pageUrl: this.pageUrlToAdd,
        websiteId: this._id,
        onCloseSuccess: this.fetchPages.bind(this),
        protocol: this.protocol,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.pageUrlToAdd = new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(\\/[^\\s]*)?$'),
        this.subpageValidator(),
      ]);

      this.pageUrlToAdd.valueChanges.subscribe(value => {
        if (value && value.startsWith(this.protocol)) {
          this.pageUrlToAdd.setValue(value.replace(this.protocol, ''), {
            emitEvent: false,
          });
        }
      });
    });
  }

  openDeleteDialog(): void {
    this.dialog.open(DeleteWebsiteDialog, {
      data: {
        websiteId: this._id,
        websiteUrl: this.website.url,
      },
    });
  }

  isSubPage(parent: string | null, page: string) {
    const fullUrl = this.protocol + page;
    if (!parent) return false;

    return (
      fullUrl.startsWith(parent) &&
      fullUrl !== parent &&
      parent !== fullUrl + '/' &&
      fullUrl !== parent + '/'
    );
  }

  subpageValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value && !this.isSubPage(this.website.url, control.value)) {
        return { invalidSubpage: true };
      }
      return null;
    };
  }

  fetchPages(
    page = 1,
    limit = 5,
    sort = 'createdAt',
    sortDirection = 'desc',
    status = 'all'
  ) {
    this.pagesService
      .getPages(this._id, page, limit, sort, sortDirection, status)
      .subscribe({
        next: res => {
          this.pages = res.pages;
          this.dataSource.data = res.pages;
          this.paginator.length = res.totalWebsitePages;
        },
        error: error => {
          console.error('Error fetching pages:', error);
        },
      });
  }
}

@Component({
  selector: 'add-page-dialog',
  templateUrl: './add-page-dialog.html',
})
export class AddPageDialog {
  constructor(
    public dialogRef: MatDialogRef<AddPageDialog>,
    @Inject(MAT_DIALOG_DATA) public data: NewPageDialogData,
    private pagesService: PagesService,
    private messageService: MessageService
  ) {}

  onAdd(): void {
    if (this.data.pageUrl.invalid) {
      console.log(this.data.pageUrl.errors);
      return;
    }
    if (this.data.pageUrl) {
      this.pagesService
        .createPage({
          url: this.data.protocol + this.data.pageUrl.value,
          websiteId: this.data.websiteId,
        })
        .subscribe({
          next: response => {
            if (response.success) {
              this.data.onCloseSuccess();
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Page added successfully',
              });
              this.dialogRef.close();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to add page',
              });
            }
          },
          error: error => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error.message || 'Failed to add page',
            });
          },
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

// Delete website dialog

@Component({
  selector: 'delete-website-dialog',
  templateUrl: './delete-website-dialog.html',
})
export class DeleteWebsiteDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteWebsiteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteWebsiteDialogData,
    private websiteService: WebsiteService,
    private messageService: MessageService,
    private router: Router
  ) {}

  onDelete(): void {
    if (this.data.websiteId) {
      this.websiteService.deleteWebsite(this.data.websiteId).subscribe({
        next: response => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Website deleted successfully',
            });
            this.dialogRef.close();
            this.router.navigate(['/websites']);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Failed to delete website',
            });
          }
        },
        error: error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error.message || 'Failed to delete website',
          });
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

// Delete pages dialog

@Component({
  selector: 'delete-pages-dialog',
  templateUrl: './delete-pages-dialog.html',
})
export class DeletePagesDialog {
  constructor(
    public dialogRef: MatDialogRef<DeletePagesDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private pagesService: PagesService,
    private messageService: MessageService
  ) {}

  onDelete(): void {
    if (this.data.pageIds) {
      this.pagesService
        .removePages(this.data.pageIds, this.data.websiteId)
        .subscribe({
          next: response => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Pages deleted successfully',
              });
              this.dialogRef.close();
              this.data.onCloseSuccess();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete pages',
              });
            }
          },
          error: error => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error.message || 'Failed to delete pages',
            });
          },
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
