"""Product substitutes mapping for medical devices"""

# Mapping of products to their acceptable substitutes
# Each product can have a list of substitute products
PRODUCT_SUBSTITUTES = {
    "Single-use electrosurgical scalpel": [
        "Reusable electrosurgical scalpel"
    ],
    "Reusable electrosurgical scalpel": [
        "Single-use electrosurgical scalpel"
    ],
    "Ventilator": [
        "CPAP"
    ],
    "CPAP": [
        "Ventilator"
    ],
    # Add more substitutes as needed
}


def get_product_with_substitutes(product: str) -> list:
    """
    Get a list containing the original product and its substitutes
    
    Args:
        product: The product name
        
    Returns:
        List of product names including the original and substitutes
    """
    if not product:
        return []
    
    products = [product]
    
    # Add substitutes if they exist
    if product in PRODUCT_SUBSTITUTES:
        products.extend(PRODUCT_SUBSTITUTES[product])
    
    return products


def is_substitute(original_product: str, offered_product: str) -> bool:
    """
    Check if offered_product is a substitute for original_product
    
    Args:
        original_product: The originally requested product
        offered_product: The product being offered
        
    Returns:
        True if offered_product is a substitute for original_product
    """
    if original_product == offered_product:
        return False  # Not a substitute, it's the same product
    
    if original_product in PRODUCT_SUBSTITUTES:
        return offered_product in PRODUCT_SUBSTITUTES[original_product]
    
    return False

