import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { WebsitesComponent } from './websites/websites.component';
import { WebsiteDetailsComponent } from './website-details/website-details.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'websites/:id', component: WebsiteDetailsComponent },
  { path: 'websites', component: WebsitesComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
