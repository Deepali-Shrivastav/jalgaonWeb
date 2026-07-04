import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import BusinessDetailsPage from './pages/BusinessDetailsPage';
import Account from './pages/Account';
import Providers from './Providers';
import AddListingPage from './pages/AddListingPage';
import AdsIndexPage from './pages/AdsIndexPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleViewPage from './pages/ArticleViewPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import AddListingForm from './components/AllForms/AddListingForm';
import BusinessDashboard from './pages/BusinessDashboard';
import ContactPage from './pages/ContactPage';
import SearchPage from './pages/SearchPage';
import NewsIndexPage from './pages/NewsIndexPage';
import NewsArticlePage from './pages/NewsArticlePage';

// Events Module Imports
import EventsIndexPage from './pages/EventsIndexPage';
import EventDetailPage from './pages/EventDetailPage';
import SubmitEventPage from './pages/SubmitEventPage';
// Jobs Module
import JobsIndexPage from './pages/JobsIndexPage';
import JobDetailPage from './pages/JobDetailPage';
import PostJobPage from './pages/PostJobPage';

// Admin Imports
import AdminGuard from './components/admin/AdminGuard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminListings from './pages/admin/AdminListings';
import AdminCategories from './pages/admin/AdminCategories';
import AdminModeration from './pages/admin/AdminModeration';
import AdminClaims from './pages/admin/AdminClaims';
import AdminReports from './pages/admin/AdminReports';
import AdminTrendingListings from './pages/admin/AdminTrendingListings';
import AdminAds from './pages/admin/AdminAds';
import AdminNews from './pages/admin/AdminNews';
import AdminNewsCreate from './pages/admin/AdminNewsCreate';
import AdminNewsComments from './pages/admin/AdminNewsComments';
import AdminNewsCategories from './pages/admin/AdminNewsCategories';
import AdminEvents from './pages/admin/AdminEvents';
import AdminJobs from './pages/admin/AdminJobs';
import AdminJobCategories from './pages/admin/AdminJobCategories';
import AdminJobApplications from './pages/admin/AdminJobApplications';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public / User App */}
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='addListig' element={<AddListingPage />} />
        <Route path='categories/:categorySlug' element={<CategoryPage />} />
        <Route path='business/jalgaon/:categorySlug/:productId' element={<BusinessDetailsPage />} />
        <Route path='account' element={<Account />} />
        <Route path='advertise' element={<AdsIndexPage />} />
        <Route path='allarticlse' element={<ArticlesPage />} />
        <Route path='articleView/:articleId' element={<ArticleViewPage />} />
        <Route path='searchResults' element={<SearchPage />} />
        <Route path='about' element={<AboutPage />} />
        <Route path='contact' element={<ContactPage />} />
        <Route path='termsAndCondition' element={<TermsPage />} />
        <Route path='editForm/:shopId' element={<AddListingForm is_edit={true}/>} />
        
        {/* Events Module */}
        <Route path='events' element={<EventsIndexPage />} />
        <Route path='events/submit' element={<SubmitEventPage />} />
        <Route path='business-dashboard/:id' element={<BusinessDashboard />} />
      </Route>

      {/* Standalone Detail Pages */}
      <Route path='/news' element={<NewsIndexPage />} />
      <Route path='/news/:slug' element={<NewsArticlePage />} />
      <Route path='/news/category/:slug' element={<NewsIndexPage />} />
      
      <Route path='/events/:slug' element={<EventDetailPage />} />

      {/* Jobs Module */}
      <Route path='/jobs' element={<JobsIndexPage />} />
      <Route path='/jobs/post' element={<PostJobPage />} />
      <Route path='/jobs/:slug' element={<JobDetailPage />} />

      {/* Admin Panel */}
      <Route path='/admin' element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route index element={<AdminDashboard />} />
        <Route path='users' element={<AdminUsers />} />
        <Route path='listings' element={<AdminListings />} />
        <Route path='categories' element={<AdminCategories />} />
        <Route path='moderation' element={<AdminModeration />} />
        <Route path='claims' element={<AdminClaims />} />
        <Route path='reports' element={<AdminReports />} />
        <Route path='trending' element={<AdminTrendingListings />} />
        <Route path='ads' element={<AdminAds />} />
        
        {/* Admin News */}
        <Route path='news' element={<AdminNews />} />
        <Route path='news/create' element={<AdminNewsCreate />} />
        <Route path='news/edit/:id' element={<AdminNewsCreate />} />
        <Route path='news/comments' element={<AdminNewsComments />} />
        <Route path='news/categories' element={<AdminNewsCategories />} />

        {/* Admin Events */}
        <Route path='events' element={<AdminEvents />} />
        
        {/* Admin Jobs */}
        <Route path='jobs' element={<AdminJobs />} />
        <Route path='jobs/categories' element={<AdminJobCategories />} />
        <Route path='jobs/applications' element={<AdminJobApplications />} />
      </Route>
    </>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Providers>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Providers>
);
