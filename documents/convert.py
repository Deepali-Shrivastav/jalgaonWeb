import os
import glob

replacements = {
    "/app/register/": "/api/v1/auth/register/",
    "/app/login/": "/api/v1/auth/login/",
    "/app/logout/": "/api/v1/auth/logout/",
    "/app/user/": "/api/v1/auth/user/",
    "/app/token/refresh/": "/api/v1/auth/token/refresh/",
    "/app/token/": "/api/v1/auth/token/",
    "/app/csrf-token/": "/api/v1/auth/csrf-token/",
    "/app/tokenKey/": "/api/v1/auth/token-key/",
    "/app/categorys/": "/api/v1/listings/categories/",
    "/app/subCategorys/": "/api/v1/listings/subcategories/",
    "/app/shopListing/": "/api/v1/listings/",
    "/app/updateShop/": "/api/v1/listings/update/",
    "/app/filtered-business/": "/api/v1/listings/by-category/",
    "/app/business-view/": "/api/v1/listings/detail/",
    "/app/listedShops/": "/api/v1/listings/my-listings/",
    "/app/editShopsData/": "/api/v1/listings/edit-data/",
    "/app/likedShops/": "/api/v1/listings/favorites/",
    "/app/searchResult/": "/api/v1/search/",
    "/app/shop_reviews/": "/api/v1/reviews/",
    "/app/get_shop_reviews/": "/api/v1/reviews/by-shop/",
    "/app/articles/": "/api/v1/news/articles/",
    "/app/active-articles/": "/api/v1/news/active/",
    "/app/articleGet/": "/api/v1/news/detail/",
    "/app/crousel-ads/": "/api/v1/ads/carousel/",
    "/app/banner-ads/": "/api/v1/ads/banners/",
    "/app/adsListing/": "/api/v1/ads/submit/",
    "/app/finance-data/": "/api/v1/finance/data/"
}

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

def main():
    src_dir = os.path.join("d:\\Projects\\jalgaonWeb\\jalgaonUi\\src")
    if not os.path.exists(src_dir):
        print(f"Directory not found: {src_dir}")
        return

    # Find all js and jsx files
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.js', '.jsx')):
                filepath = os.path.join(root, file)
                replace_in_file(filepath)

if __name__ == "__main__":
    main()
