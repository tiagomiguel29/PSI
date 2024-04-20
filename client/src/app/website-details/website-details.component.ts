import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebsiteService } from '../services/website.service';
import { Page } from 'src/types/Page';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Sort } from '@angular/material/sort';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject } from '@angular/core';

export interface DialogData {
  pageUrl: string;
}

@Component({
  selector: 'app-website-details',
  templateUrl: './website-details.component.html',
  styleUrls: ['./website-details.component.css']
})
export class WebsiteDetailsComponent {
  _id: string;
  website: any;
  pages: Page[] = [];
  pageUrlToAdd: string = '';

  displayedColumns: string[] = ['url', 'status', 'createdAt', 'lastEvaluated', 'actions'];
  dataSource = new MatTableDataSource<Page>([]);

  constructor(private route: ActivatedRoute,
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
      next: (website) => {
        this.website = website;
        this.pages = website.pages || [];
        this.dataSource = new MatTableDataSource<Page>(website.pages);
      },
      error: (error) => {
        console.error('Error fetching website:', error);
        // You might want to handle errors better, e.g., displaying a message to the user
      }
    });
  }

  ngOnInit() {
    this.fetchWebsite();
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(AddPageDialog, {
      data: {pageUrl: this.pageUrlToAdd},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.pageUrlToAdd = result;
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
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
