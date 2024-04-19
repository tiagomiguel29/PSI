import { Component } from '@angular/core';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { Website } from 'src/types/Website';
import {AfterViewInit, ViewChild} from '@angular/core';
import { WebsiteService } from '../services/website.service';
import { ActivatedRoute, Router } from '@angular/router';

import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-websites',
  templateUrl: './websites.component.html',
  styleUrls: ['./websites.component.css']
})
export class WebsitesComponent {
  websites: Website[] = [{}, {}, {}, {}, {}];
  pages!: number;
  currentPage!: number;
  limit!: number;
  isLoading = true;

  displayedColumns: string[] = ['url', 'status', 'createdAt', 'lastEvaluated', 'actions'];
  dataSource = new MatTableDataSource<{}>(this.websites);


  constructor(private _liveAnnouncer: LiveAnnouncer, private websiteService: WebsiteService, private route: ActivatedRoute, private router: Router) {}


  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;


  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.route.queryParamMap.subscribe(params => {
      this.currentPage = Number(params.get('page')) || 1;
      this.limit = Number(params.get('limit')) || 10;

      this.fetchWebsites(this.currentPage, this.limit);
    })

    this.paginator.page.subscribe(() => {
      this.currentPage = this.paginator.pageIndex + 1;
      this.limit = this.paginator.pageSize;

      this.updateQueryParams();
      this.fetchWebsites(this.currentPage, this.limit);
    });
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

  updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.paginator.pageIndex + 1,
        limit: this.paginator.pageSize
      },
      queryParamsHandling: 'merge', // Merge with existing query params
    });
  }

  ngOnInit() {
    this.currentPage = Number(this.route.snapshot.queryParamMap.get('page')) || 1;
    this.limit = Number(this.route.snapshot.queryParamMap.get('limit')) || 10;
    this.fetchWebsites(this.currentPage, this.limit);

  }

  fetchWebsites(page = 1, limit = 10, sort = 'createdAt', sortDirection = 'desc') {
    this.isLoading = true;
    this.websiteService.getWebsites(page, limit, sort, sortDirection).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.websites = res.websites;
        this.dataSource = new MatTableDataSource(res.websites);
        this.paginator.length = res.totalWebsites


      },
      error: (error) => {
        console.error('Error fetching websites:', error);
        this.isLoading = false;
      }
    });
  }
}
