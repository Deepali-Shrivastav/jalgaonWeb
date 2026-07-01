import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import BusinessDetailsPage from './pages/BusinessDetailsPage';
import Account from './pages/Account';
import { UserProvider } from './context/UserContext';
import Providers from './Providers';
import AddListingPage from './pages/AddListingPage';
import AddAdvertise from './pages/AddAdvertise';
import ArticlesPage from './pages/ArticlesPage';
import Articles from './components/Releatedarticles/Articles';
import ArticleViewPage from './pages/ArticleViewPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import AddListingForm from './components/AllForms/AddListingForm';
import ContactPage from './pages/ContactPage';
import SearchPage from './pages/SearchPage';

// Admin Imports
import AdminGuard from './components/admin/AdminGuard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminListings from './pages/admin/AdminListings';
import AdminCategories from './pages/admin/AdminCategories';
import AdminModeration from './pages/admin/AdminModeration';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public / User App */}
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='addListig' element={<AddListingPage />} />
        <Route path='categories/:mainCategoryId/:mainCategory' element={<CategoryPage />} />
        <Route path='productView/:productId' element={<BusinessDetailsPage />} />
        <Route path='account' element={<Account />} />
        <Route path='advertise' element={<AddAdvertise />} />
        <Route path='allarticlse' element={<ArticlesPage />} />
        <Route path='articleView/:articleId' element={<ArticleViewPage />} />
        <Route path='searchResults' element={<SearchPage />} />
        <Route path='about' element={<AboutPage />} />
        <Route path='contact' element={<ContactPage />} />
        <Route path='termsAndCondition' element={<TermsPage />} />
        <Route path='editForm/:shopId' element={<AddListingForm is_edit={true}/>} />
      </Route>

      {/* Admin Panel */}
      <Route path='/admin' element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route index element={<AdminDashboard />} />
        <Route path='users' element={<AdminUsers />} />
        <Route path='listings' element={<AdminListings />} />
        <Route path='categories' element={<AdminCategories />} />
        <Route path='moderation' element={<AdminModeration />} />
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
