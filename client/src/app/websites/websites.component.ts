import { Component } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Website } from 'src/types/Website';
import { ViewChild } from '@angular/core';
import { WebsiteService } from '../services/website.service';
import { ActivatedRoute, Router } from '@angular/router';

import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-websites',
  templateUrl: './websites.component.html',
  styleUrls: ['./websites.component.scss'],
})
export class WebsitesComponent {
  websites: Website[] = [{}, {}, {}, {}, {}];
  pages!: number;
  currentPage = 1;
  limit = 5;
  isLoading = true;
  sort = 'createdAt';
  sortDirection = 'desc';
  status = 'all';
  statusOptions: any[] = [
    { value: 'all', viewValue: 'All' },
    { value: 'Por avaliar', viewValue: 'Por avaliar' },
    { value: 'Em avaliação', viewValue: 'Em avaliação' },
    { value: 'Avaliado', viewValue: 'Avaliado' },
    { value: 'Erro na avaliação', viewValue: 'Erro na avaliação' },
  ];
  statusFormControl = new FormControl('all');

  displayedColumns: string[] = [
    'url',
    'status',
    'createdAt',
    'lastEvaluated',
    'actions',
  ];
  dataSource = new MatTableDataSource<{}>(this.websites);

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private websiteService: WebsiteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  @ViewChild(MatSort) sortComponent!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.route.queryParamMap.subscribe(params => {
      this.currentPage = Number(params.get('page')) || 1;
      this.limit = Number(params.get('limit')) || 5;
      this.sort = params.get('sort') || 'createdAt';
      this.sortDirection = params.get('sortDirection') || 'desc';
      this.paginator.pageSize = this.limit;
      this.paginator.pageIndex = this.currentPage - 1;
      this.status = params.get('status') || 'all';
      this.statusFormControl = params.get('status') ? new FormControl(params.get('status')) : new FormControl('all');
      this.statusFormControl.valueChanges.subscribe(value => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { status: value },
          queryParamsHandling: 'merge',
        });
      });
      this.fetchWebsites(this.currentPage, this.limit, this.sort, this.sortDirection, this.status);
    });

    this.paginator.page.subscribe(() => {
      this.currentPage = this.paginator.pageIndex + 1;
      this.limit = this.paginator.pageSize;

      this.updateQueryParams();
      this.fetchWebsites(this.currentPage, this.limit);
    });

    this.sortComponent.sortChange.subscribe((sortState: Sort) => {
      this.sort = sortState.active || 'createdAt';
      this.sortDirection = sortState.direction || 'desc';

      this.updateQueryParams();
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
        limit: this.paginator.pageSize,
        sort: this.sort,
        sortDirection: this.sortDirection,
        status: this.statusFormControl.value
      },
      queryParamsHandling: 'merge', // Merge with existing query params
    });
  }

  ngOnInit() {
    this.currentPage =
      Number(this.route.snapshot.queryParamMap.get('page')) || 1;
    this.limit = Number(this.route.snapshot.queryParamMap.get('limit')) || 5;
    this.sort = this.route.snapshot.queryParamMap.get('sort') || 'createdAt';
    this.sortDirection =
      this.route.snapshot.queryParamMap.get('sortDirection') || 'desc';
    this.status = this.route.snapshot.queryParamMap.get('status') || 'all';
    this.statusFormControl = this.route.snapshot.queryParamMap.get('status')
      ? new FormControl(this.route.snapshot.queryParamMap.get('status'))
      : new FormControl('all');
    this.paginator.pageSize = this.limit;
    this.paginator.pageIndex = this.currentPage - 1;

    this.statusFormControl.valueChanges.subscribe(value => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { status: value },
        queryParamsHandling: 'merge',
      });
    });
  }

  fetchWebsites(
    page = 1,
    limit = 5,
    sort = 'createdAt',
    sortDirection = 'desc',
    status = 'all'
  ) {
    this.isLoading = true;
    this.websiteService
      .getWebsites(page, limit, sort, sortDirection, status)
      .subscribe({
        next: res => {
          this.isLoading = false;
          this.websites = res.websites;
          this.dataSource = new MatTableDataSource(res.websites);
          this.paginator.length = res.totalWebsites;
        },
        error: error => {
          console.error('Error fetching websites:', error);
          this.isLoading = false;
        },
      });
  }
}
