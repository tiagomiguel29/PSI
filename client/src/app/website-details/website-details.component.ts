import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebsiteService } from '../services/website.service';
import { Page } from 'src/types/Page';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Sort } from '@angular/material/sort';
import { ValidatorFn, AbstractControl } from '@angular/forms';
import { Validators } from '@angular/forms';

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { PagesService } from '../services/pages.service';
import { MessageService } from 'primeng/api';
import { FormControl } from '@angular/forms';

export interface DialogData {
  websiteId: string;
  pageUrl: FormControl;
  onCloseSuccess: Function;
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
  pageUrlToAdd = new FormControl('', [
    Validators.required,
    Validators.pattern('^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(\\/[^\\s]*)?$'),
    this.subpageValidator(),
  ]);

  displayedColumns: string[] = ['url', 'status', 'createdAt', 'lastEvaluated'];
  dataSource = new MatTableDataSource<Page>([]);

  constructor(
    private route: ActivatedRoute,
    private websiteService: WebsiteService,
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog
  ) {
    this._id = this.route.snapshot.paramMap.get('id')!;
  }

  @ViewChild(MatSort) sort!: MatSort;
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

  fetchWebsite() {
    this.websiteService.getWebsiteById(this._id).subscribe({
      next: website => {
        this.website = website;
        this.pages = website.pages || [];
        this.dataSource = new MatTableDataSource<Page>(website.pages);
        if (website.previewImageStatus === 'Captured') {
          this.imageUrl = website.imageUrl;
          this.imageLoading = false;
        } else {
          this.imageLoading = true;
        }
      },
      error: error => {
        console.error('Error fetching website:', error);
      },
    });
  }

  ngOnInit() {
    this.fetchWebsite();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddPageDialog, {
      data: {
        pageUrl: this.pageUrlToAdd,
        websiteId: this._id,
        onCloseSuccess: this.fetchWebsite.bind(this),
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.pageUrlToAdd = new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(\\/[^\\s]*)?$'),
        this.subpageValidator(),
      ]);
    });
  }

  isSubPage(parent: string | null, page: string) {
    const fullUrl = 'https://' + page;
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
}

@Component({
  selector: 'add-page-dialog',
  templateUrl: './add-page-dialog.html',
})
export class AddPageDialog {
  constructor(
    public dialogRef: MatDialogRef<AddPageDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private pagesService: PagesService,
    private messageService: MessageService
  ) {}

  onAdd(): void {
    if (this.data.pageUrl.invalid) return;
    if (this.data.pageUrl) {
      this.pagesService
        .createPage({
          url: 'https://' + this.data.pageUrl.value,
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
