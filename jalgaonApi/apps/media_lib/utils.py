import re

def generate_seo_alt_text(instance, field_name):
    """
    Intelligently generates an SEO-friendly ALT text for an image based on available fields.
    """
    parts = []

    # Priority 1: Main entity identifiers
    identifiers = ['title', 'name', 'business_name', 'headline', 'main_category', 'sub_category']
    
    # Check if instance is a model that might have a main category related object
    # For example: instance.main_category.main_category
    for attr in identifiers:
        if hasattr(instance, attr):
            val = getattr(instance, attr)
            if val:
                # If it's a related model object
                if hasattr(val, 'name'):
                    parts.append(str(val.name))
                elif hasattr(val, 'title'):
                    parts.append(str(val.title))
                elif hasattr(val, 'main_category'):
                    parts.append(str(val.main_category))
                elif hasattr(val, 'sub_category'):
                    parts.append(str(val.sub_category))
                else:
                    parts.append(str(val))

    # Priority 2: Location data
    locations = ['city', 'location', 'business_address', 'address']
    for attr in locations:
        if hasattr(instance, attr):
            val = getattr(instance, attr)
            if val and str(val).lower() not in ['n/a', 'none', 'null', '']:
                # For address we might just want the city or short version if it's too long, but we'll include it
                parts.append(str(val))

    # Fallback to model name if parts is empty
    if not parts:
        model_name = instance.__class__.__name__
        # Convert CamelCase to readable string
        model_name = re.sub(r'(?<!^)(?=[A-Z])', ' ', model_name)
        parts.append(f"{model_name} image")

    # Clean up and construct
    raw_alt = " ".join(parts)
    # Remove excessive spaces and special chars, keep alphanumeric, spaces, and commas
    clean_alt = re.sub(r'[^\w\s,.-]', '', raw_alt)
    clean_alt = re.sub(r'\s+', ' ', clean_alt).strip()

    # If it's still empty for some reason, use a generic fallback
    if not clean_alt:
        clean_alt = "Image"

    # Truncate to 250 characters to fit the database field and avoid keyword stuffing
    return clean_alt[:250]
