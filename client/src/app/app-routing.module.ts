import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { WebsitesComponent } from './websites/websites.component'

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'websites', component: WebsitesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
