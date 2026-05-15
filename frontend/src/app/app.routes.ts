import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Articles } from './pages/articles/articles';
import { CreateArticle } from './pages/create-article/create-article';
import { ArticleDetails } from './pages/article-details/article-details';
import { AutomationRuns } from './pages/automation-runs/automation-runs';
import { UploadConsole } from './pages/upload-console/upload-console';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: Dashboard,
  },
  {
    path: 'articles',
    component: Articles,
  },
  {
    path: 'articles/create',
    component: CreateArticle,
  },
  {
    path: 'articles/:id',
    component: ArticleDetails,
  },
  {
    path: 'automation',
    component: AutomationRuns,
  },
  {
    path: 'upload',
    component: UploadConsole,
  },
];