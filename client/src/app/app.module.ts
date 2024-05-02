import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MenubarModule } from 'primeng/menubar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { TableModule } from 'primeng/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { SkeletonModule } from 'primeng/skeleton';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastModule } from 'primeng/toast';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';

import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { HomeComponent } from './home/home.component';
import { WebsitesComponent } from './websites/websites.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DeleteWebsiteDialog, WebsiteDetailsComponent, DeletePagesDialog } from './website-details/website-details.component';
import { AddPageDialog } from './website-details/website-details.component';
import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WebsitesComponent,
    WebsiteDetailsComponent,
    AddPageDialog,
    DeleteWebsiteDialog,
    DeletePagesDialog,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MenubarModule,
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatButtonModule,
    BrowserAnimationsModule,
    TableModule,
    MatTableModule,
    MatSortModule,
    MatCardModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatChipsModule,
    SkeletonModule,
    MatSelectModule,
    MatDialogModule,
    ToastModule,
    MatCheckboxModule,
    MatTooltipModule,

  ],
  providers: [MessageService],
  bootstrap: [AppComponent],
})
export class AppModule {}
