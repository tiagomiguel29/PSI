import { Component } from '@angular/core';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { Website } from 'src/types/Website';
import {AfterViewInit, ViewChild} from '@angular/core';

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
  dataSource = new MatTableDataSource(this.websites);


  constructor(private _liveAnnouncer: LiveAnnouncer) {}

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
    this.websites = [
      {
        url: 'https://example.com',
        createdAt: '2021-08-01',
        status: 'active',
        lastEvaluated: '2021-08-01'
      },
      {
        url: 'https://example.net',
        createdAt: '2021-08-01',
        status: 'active',
        lastEvaluated: '2021-08-01'
      },
      {
        url: 'https://example.net',
        createdAt: '2021-08-01',
        status: 'active',
        lastEvaluated: '2021-08-01'
      },
      {
        url: 'https://example.net',
        createdAt: '2021-08-01',
        status: 'active',
        lastEvaluated: '2021-08-01'
      }
        ];
        this.dataSource = new MatTableDataSource(this.websites);
  }
}
