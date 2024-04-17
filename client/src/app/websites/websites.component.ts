import { Component } from '@angular/core';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { Website } from 'src/types/Website';
import {AfterViewInit, ViewChild} from '@angular/core';
import { WebsiteService } from '../services/website.service';

import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-websites',
  templateUrl: './websites.component.html',
  styleUrls: ['./websites.component.css']
})
export class WebsitesComponent {
  websites!: Website[];

  displayedColumns: string[] = ['url', 'createdAt', 'status', 'lastEvaluated'];
  dataSource = new MatTableDataSource<Website>([]);


  constructor(private _liveAnnouncer: LiveAnnouncer, private websiteService: WebsiteService) {}

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

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

  ngOnInit() {
    this.fetchWebsites();
  }

  fetchWebsites() {
    this.websiteService.getWebsites().subscribe({
      next: (websites) => {
        this.dataSource.data = websites;
      },
      error: (error) => {
        console.error('Error fetching websites:', error);
        // You might want to handle errors better, e.g., displaying a message to the user
      }
    });
  }
}
